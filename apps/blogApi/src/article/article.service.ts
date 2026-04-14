import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface ArticleQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryIds?: number[];
  status?: number;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ArticleQuery, isAdmin: boolean = false) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryIds,
      status,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    // 权限与状态过滤逻辑
    let statusFilter: any = status !== undefined ? { status } : {};
    if (!isAdmin && status === undefined) {
      statusFilter = { status: 1 }; // 游客默认只看已发布
    }

    const where: any = {
      AND: [
        statusFilter,
        categoryIds && categoryIds.length > 0
          ? { categories: { some: { id: { in: categoryIds } } } }
          : {},
      ],
    };
    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search } },
          { summary: { contains: search } },
          { content: { contains: search } },
        ],
      });
    }

    if (startDate || endDate) {
      where.AND.push({
        createdAt: {
          gte: startDate
            ? new Date(new Date(startDate).setHours(0, 0, 0, 0))
            : undefined,
          lte: endDate
            ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
            : undefined,
        },
      });
    }

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: {
          categories: { select: { id: true, name: true } },
          author: { select: { username: true, avatar: true } },
          tags: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        categories: true,
        tags: true,
        media: true,
      },
    });
    if (!article) throw new NotFoundException('文章未找到');
    return article;
  }

  async create(userId: number, data: any) {
    // 显式剔除已在模型中删除的字段，防止它们进入 Prisma 操作
    const { tagIds, categoryIds, categoryId, type, slug, ...rest } = data;
    return this.prisma.article.create({
      data: {
        ...rest,
        authorId: userId,
        categories: {
          connect: categoryIds?.map((id: number) => ({ id })) || [],
        },
        tags: {
          connect: tagIds?.map((id: number) => ({ id })) || [],
        },
      },
    });
  }

  async update(id: number, userId: number, data: any) {
    // 显式剔除已在模型中删除的字段，防止它们进入 Prisma 操作
    const { tagIds, categoryIds, categoryId, type, slug, ...rest } = data;
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('文章不存在');

    return this.prisma.article.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryIds !== undefined && {
          categories: {
            set: categoryIds.map((id: number) => ({ id })),
          },
        }),
        ...(tagIds !== undefined && {
          tags: {
            set: tagIds.map((id: number) => ({ id })),
          },
        }),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.article.delete({ where: { id } });
  }

  async incrementClicks(id: number) {
    return this.prisma.article.update({
      where: { id },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }
}
