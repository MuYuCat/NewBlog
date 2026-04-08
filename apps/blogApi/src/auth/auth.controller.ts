import {
  Controller,
  Post,
  Get,
  Body,
  UsePipes,
  PipeTransform,
  BadRequestException,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { LoginSchema } from '@newblog/validation';
import type { LoginInput } from '@newblog/validation';
import { ZodSchema } from 'zod';
import { AuthGuard } from './auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    username: string;
    role: string;
  };
}

class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: '验证失败',
        errors: result.error.errors,
      });
    }
    return result.data as unknown;
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() loginInput: LoginInput): Promise<LoginResponse> {
    return this.authService.login(loginInput);
  }

  // 获取当前用户信息，用于前端 initialState 模型同步
  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: AuthenticatedRequest) {
    // 从 Guard 解析出来的 JWT payload 中提取 sub (用户 ID)
    return this.authService.getProfile(req.user.sub);
  }

  // 更新个人档案
  @Post('update-profile')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: { username?: string; password?: string },
  ) {
    return this.authService.updateProfile(req.user.sub, body);
  }

  // 2FA: 验证动态码进行登录
  @Post('2fa/verify')
  @HttpCode(200)
  async verify2FALogin(
    @Body() body: { userId: number; token: string },
  ): Promise<LoginResponse> {
    return this.authService.verify2FALogin(body.userId, body.token);
  }

  // 2FA: 生成密钥 (绑定前调用)
  @Post('2fa/generate')
  @HttpCode(200)
  async generate2FASecret(@Body() body: { userId: number }) {
    return this.authService.generate2FASecret(body.userId);
  }

  // 2FA: 正式开启
  @Post('2fa/enable')
  @HttpCode(200)
  async enable2FA(
    @Body() body: { userId: number; secret: string; token: string },
  ) {
    return this.authService.enable2FA(body.userId, body.secret, body.token);
  }

  // 2FA: 正式关闭
  @Post('2fa/disable')
  @HttpCode(200)
  async disable2FA(@Body() body: { userId: number; token: string }) {
    return this.authService.disable2FA(body.userId, body.token);
  }
}
