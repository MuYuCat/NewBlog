import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import type { LoginInput } from '@newblog/validation';
import * as bcrypt from 'bcrypt';
import * as qrcode from 'qrcode';
import * as otplib from 'otplib';

/**
 * 局部定义 Authenticator 接口，解决 otplib 13+ 类型解析在 ESLint 下的兼容性问题
 */
interface IAuthenticator {
  generateSecret(): string;
  verify(params: { token: string; secret: string }): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { authenticator } = otplib as any;
const auth = authenticator as IAuthenticator;

export interface LoginResponse {
  access_token?: string;
  require2FA?: boolean;
  userId?: number;
  user: {
    id: number;
    username: string;
    role: string;
    avatar: string | null;
    isTwoFactorEnabled?: boolean;
  };
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 初始化管理员账号
  async onModuleInit() {
    const adminUsername = 'MuYuCat';
    const adminPassword = 'iamadmin';

    const user = await this.prisma.user.findUnique({
      where: { username: adminUsername },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.prisma.user.create({
        data: {
          username: adminUsername,
          password: hashedPassword,
          role: 'ADMIN',
          status: 1,
        },
      });
      console.log(`🚀 Initialized admin user: ${adminUsername}`);
    }
  }

  // 登录逻辑
  async login(loginInput: LoginInput): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username: loginInput.username },
    });

    if (!user || !(await bcrypt.compare(loginInput.password, user.password))) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 检查是否启用了 2FA
    if (user.isTwoFactorEnabled) {
      return {
        require2FA: true,
        userId: user.id,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          avatar: user.avatar,
        },
      };
    }

    const payload = { sub: user.id, username: user.username, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }

  // 获取当前用户信息
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        avatar: true,
        isTwoFactorEnabled: true,
      },
    });

    if (!user) throw new UnauthorizedException('用户不存在');
    return user;
  }

  // 更新个人档案
  async updateProfile(
    userId: number,
    data: { username?: string; password?: string },
  ) {
    const updateData: Record<string, string> = {};
    if (data.username) updateData.username = data.username;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
    };
  }

  // 2FA: 生成密钥和二维码 (绑定前调用，或绑定后查看)
  async generate2FASecret(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('用户不存在');

    let secret = user.twoFactorSecret;
    if (!secret) {
      secret = auth.generateSecret();
    }

    const accountName = encodeURIComponent(user.username);
    const issuer = encodeURIComponent('MuYuCat');
    const otpauthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;

    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    return {
      secret,
      qrCodeDataUrl,
    };
  }

  // 2FA: 开启双重认证
  async enable2FA(userId: number, secret: string, token: string) {
    const isValid = auth.verify({ token, secret });
    if (!isValid) throw new BadRequestException('验证码错误，请确保时间同步');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        isTwoFactorEnabled: true,
      },
    });

    return { message: '2FA 成功启用' };
  }

  // 2FA: 验证动态码进行登录
  async verify2FALogin(userId: number, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret)
      throw new UnauthorizedException('未发现安全配置');

    const isValid = auth.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) throw new UnauthorizedException('动态验证码错误');

    const payload = { sub: user.id, username: user.username, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }

  // 2FA: 关闭双重认证
  async disable2FA(userId: number, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret)
      throw new BadRequestException('未启用 2FA');

    const isValid = auth.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) throw new BadRequestException('验证码错误');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        isTwoFactorEnabled: false,
      },
    });

    return { message: '2FA 已关闭' };
  }
}
