import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  // 1. 获取所有 Master Game 列表
  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: number;
  }) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.title = { contains: search };
    }
    if (status) {
      where.platforms = { some: { status } };
    }

    const [items, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        skip,
        take: limit,
        include: {
          platforms: {
            include: { _count: { select: { achievements: true } } },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.game.count({ where }),
    ]);

    return { items, total };
  }

  // 2. 获取单个游戏详情（包含所有平台和成就摘要）
  async findOne(id: number) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        platforms: {
          include: {
            achievements: { take: 5 }, // 仅预览前5个
            _count: { select: { achievements: true } },
          },
        },
      },
    });
    if (!game) throw new NotFoundException('游戏档案不存在');
    return game;
  }

  // 3. 手动创建 Master Game 并关联平台
  async create(data: any) {
    const { platforms, ...gameData } = data;
    return this.prisma.game.create({
      data: {
        ...gameData,
        platforms: {
          create: platforms || [],
        },
      },
    });
  }

  // 4. 更新游戏档案
  async update(id: number, data: any) {
    const gameData = { ...data };
    delete gameData.platforms;

    return this.prisma.game.update({
      where: { id },
      data: gameData,
    });
  }

  // 5. 合并平台：将一个独立的平台记录迁移到另一个 Master Game 下
  async mergePlatform(sourcePlatformId: number, targetGameId: number) {
    return this.prisma.gamePlatform.update({
      where: { id: sourcePlatformId },
      data: { gameId: targetGameId },
    });
  }

  // 6. 删除游戏（物理删除，会连带删除平台和成就）
  async remove(id: number) {
    return this.prisma.game.delete({ where: { id } });
  }

  // 7. 同步配置管理
  async getSyncConfig() {
    return this.prisma.gameSyncConfig.findMany();
  }

  async updateSyncConfig(platform: string, config: any) {
    return this.prisma.gameSyncConfig.upsert({
      where: { platform },
      update: { config },
      create: {
        platform,
        config,
        status: 1,
      },
    });
  }

  // 8. 获取全局同步状态
  async getSyncState() {
    return this.prisma.gameSyncConfig.findUnique({
      where: { platform: 'GLOBAL_SYNC_STATE' },
    });
  }
}
