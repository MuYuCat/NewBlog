import {
  Controller,
  Post,
  Body,
  UsePipes,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { LoginSchema } from '@newblog/validation';
import type { LoginInput } from '@newblog/validation';
import { ZodSchema } from 'zod';

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
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() loginInput: LoginInput): Promise<LoginResponse> {
    return this.authService.login(loginInput);
  }
}
