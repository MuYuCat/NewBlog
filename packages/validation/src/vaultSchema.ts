import { z } from 'zod';

export const tagSchema = z.object({
  name: z.string().min(1, '标签名称不能为空').max(20, '标签名称过长'),
  color: z.string().optional(),
});

export const bookmarkSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题过长'),
  url: z.string().url('请输入有效的 URL 地址'),
  description: z.string().max(500, '描述内容过长').optional(),
  coverUrl: z.string().url('封面图链接格式不正确').optional().or(z.literal('')),
  tagIds: z.array(z.number()).optional(),
});

export type CreateTagDto = z.infer<typeof tagSchema>;
export type CreateBookmarkDto = z.infer<typeof bookmarkSchema>;
