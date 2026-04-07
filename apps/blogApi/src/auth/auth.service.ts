import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import type { LoginInput } from '@newblog/validation';
import * as bcrypt from 'bcrypt';

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    role: string;
    avatar: string | null;
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

    console.log(`🔍 Checking if admin user ${adminUsername} exists...`);
    const user = await this.prisma.user.findUnique({
      where: { username: adminUsername },
    });

    if (!user) {
      console.log(`🚀 Initializing admin user: ${adminUsername}`);
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      try {
        await this.prisma.user.create({
          data: {
            username: adminUsername,
            password: hashedPassword,
            role: 'ADMIN',
            status: 1,
          },
        });
        console.log('✅ Admin user initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize admin user:', error);
      }
    } else {
      console.log(`✅ Admin user ${adminUsername} already exists`);
    }
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const { username, password } = input;

    // 兜底逻辑：如果数据库中没有任何用户，且当前尝试登录的是 MuYuCat，则尝试初始化
    const userCount = await this.prisma.user.count();
    if (userCount === 0 && username === 'MuYuCat') {
      await this.onModuleInit();
    }

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status === 0) {
      throw new UnauthorizedException('账户已被禁用');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }
}
