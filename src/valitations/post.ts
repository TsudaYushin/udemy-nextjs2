import { z } from 'zod';

export const postSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'タイトルは3文字以上で入力してください' })
    .max(255, { message: 'タイトルは255文字以内で入力してください' }),
  content: z
    .string()
    .min(10, { message: '内容は10文字以上で入力してください' }),
  topImage: z
    .union([z.instanceof(File), z.string().url(), z.string().startsWith('/images/')])
    .nullable()
    .optional(),
  published: z.boolean().default(true), // デフォルト値をtrueに設定
});

export type PostSchema = z.infer<typeof postSchema>;    