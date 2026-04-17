import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GameSyncService {
  private readonly logger = new Logger(GameSyncService.name);

  // 状态常量
  private readonly STATUS = {
    FAIL: 0,
    SUCCESS: 1,
    SYNCING: 2,
    RISK: 3, // 被平台拦截/封禁风险
  };

  constructor(private prisma: PrismaService) {}

  @Cron('0 */12 * * *')
  async autoSync() {
    this.logger.log('[GameSync] 触发自动同步任务...');
    const check = await this.preCheckSync();
    if (!check.allowed) return;
    await this.executeSync('AUTO_CRON');
  }

  async manualSync() {
    const check = await this.preCheckSync();
    if (!check.allowed) {
      throw new HttpException(check.reason, HttpStatus.TOO_MANY_REQUESTS);
    }
    return this.executeSync('ADMIN_MANUAL');
  }

  /**
   * 核心预检逻辑：不论是本地 dev 还是生产 prod，全部走数据库强校验
   */
  private async preCheckSync(): Promise<{ allowed: boolean; reason?: string }> {
    const config = await this.prisma.gameSyncConfig.findUnique({
      where: { platform: 'GLOBAL_SYNC_STATE' },
    });

    if (!config) return { allowed: true };

    // 1. 拦截正在进行的同步
    if (config.status === this.STATUS.SYNCING) {
      return {
        allowed: false,
        reason: '同步正在进行中，安全锁已生效，请勿在本地或线上频繁刷新。',
      };
    }

    // 2. 拦截风险账号（必须手动解除）
    if (config.status === this.STATUS.RISK) {
      return {
        allowed: false,
        reason:
          '账号已被平台风险警告，为了资产安全，自动同步已物理熔断。请在后台排查。',
      };
    }

    // 3. CD 校验
    if (config.lastSyncAt) {
      const diffMin =
        (Date.now() - new Date(config.lastSyncAt).getTime()) / (1000 * 60);
      const isDev = process.env.NODE_ENV !== 'production';

      // 成功后的冷却：生产环境 120 分钟，本地环境 10 分钟（方便调试，但依然不准疯狂调用）
      const coolDown = isDev ? 10 : 120;

      if (config.status === this.STATUS.SUCCESS && diffMin < coolDown) {
        return {
          allowed: false,
          reason: `安全锁冷却中：${Math.ceil(coolDown - diffMin)} 分钟后可用。本地调试请勿暴力请求。`,
        };
      }

      // 失败后的重试冷却：强制 5 分钟
      if (config.status === this.STATUS.FAIL && diffMin < 5) {
        return {
          allowed: false,
          reason: `重试冷却中：请在 ${Math.ceil(5 - diffMin)} 分钟后重试。`,
        };
      }
    }

    return { allowed: true };
  }

  private async executeSync(source: string) {
    this.logger.log(`[GameSync] 锁定全局状态位，执行源: ${source}`);

    // 加锁
    await this.prisma.gameSyncConfig.upsert({
      where: { platform: 'GLOBAL_SYNC_STATE' },
      update: { status: this.STATUS.SYNCING, errorMessage: null },
      create: { platform: 'GLOBAL_SYNC_STATE', status: this.STATUS.SYNCING },
    });

    try {
      // --- 真正的抓取逻辑将在此处执行 ---
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 模拟一个随机失败来测试安全阀
      // if (Math.random() > 0.8) throw new Error('403 Forbidden: PSN SSO Failed');

      const now = new Date();
      await this.prisma.gameSyncConfig.update({
        where: { platform: 'GLOBAL_SYNC_STATE' },
        data: { status: this.STATUS.SUCCESS, lastSyncAt: now, updatedAt: now },
      });

      return { success: true, time: now };
    } catch (e: any) {
      const isRisk =
        e.message.includes('403') ||
        e.message.includes('Forbidden') ||
        e.message.includes('Auth');
      const status = isRisk ? this.STATUS.RISK : this.STATUS.FAIL;

      await this.prisma.gameSyncConfig.update({
        where: { platform: 'GLOBAL_SYNC_STATE' },
        data: {
          status,
          errorMessage: e.message,
          lastErrorLog: { detail: e.stack, source },
          updatedAt: new Date(),
        },
      });

      throw new HttpException(
        `同步异常: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
