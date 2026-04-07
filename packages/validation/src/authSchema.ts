import { z } from 'zod';

/**
 * 登录校验 Schema
 */
export const LoginSchema = z.object({
  username: z.string().min(3, '用户名长度至少为 3 位').max(20, '用户名长度最多为 20 位'),
  password: z.string().min(6, '密码长度至少为 6 位').max(32, '密码长度最多为 32 位'),
  remember: z.boolean().optional().default(false),
});

/**
 * 注册校验 Schema
 */
export const RegisterSchema = LoginSchema.extend({
  email: z.string().email('邮箱格式不正确').toLowerCase(),
  confirmPassword: z.string().min(1, '请确认密码'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
