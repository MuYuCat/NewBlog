import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface ArticleQuery {
  search?: string;
  type?: string;
  categoryId?: number;
  status?: number;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ArticleQuery) {
    const { search, type, categoryId, status, startDate, endDate } = query;

    return this.prisma.article.findMany({
      where: {
        AND: [
          type ? { type } : {},
          status !== undefined ? { status } : {},
          categoryId ? { categoryId } : {},
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { summary: { contains: search } },
                  { content: { contains: search } },
                ],
              }
            : {},
          startDate || endDate
            ? {
                createdAt: {
                  gte: startDate ? new Date(startDate) : undefined,
                  lte: endDate ? new Date(endDate) : undefined,
                },
              }
            : {},
        ],
      },
      include: {
        category: true,
        author: {
          select: { username: true, avatar: true },
        },
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        media: true,
      },
    });
    if (!article) throw new NotFoundException('文章未找到');
    return article;
  }

  async create(userId: number, data: any) {
    const { tagIds, categoryId, ...rest } = data;
    return this.prisma.article.create({
      data: {
        ...rest,
        authorId: userId,
        categoryId: categoryId || null,
        tags: {
          connect: tagIds?.map((id: number) => ({ id })) || [],
        },
      },
    });
  }

  async update(id: number, userId: number, data: any) {
    const { tagIds, categoryId, ...rest } = data;
    // 简单权限检查
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('文章不存在');

    return this.prisma.article.update({
      where: { id },
      data: {
        ...rest,
        categoryId: categoryId || null,
        tags: {
          set: tagIds?.map((id: number) => ({ id })) || [],
        },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.article.delete({ where: { id } });
  }
}
