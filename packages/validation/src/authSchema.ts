import { z } from 'zod';

/**
 * 登录校验 Schema
 */
export const LoginSchema = z.object({
  username: z
    .string()
    .min(3, '用户名长度至少为 3 位')
    .max(20, '用户名长度最多为 20 位')
    .regex(/^[a-zA-Z]/, '用户名必须以字母开头')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名仅限字母、数字和下划线'),
  password: z
    .string()
    .min(8, '密码长度至少为 8 位')
    .max(32, '密码长度最多为 32 位')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[0-9]/, '密码必须包含数字')
    .regex(/[^a-zA-Z0-9]/, '密码必须包含特殊字符'),
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
