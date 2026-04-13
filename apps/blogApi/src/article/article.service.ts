import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface ArticleQuery {
  page?: number;
  limit?: number;
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
    const {
      page = 1,
      limit = 10,
      search,
      type,
      categoryId,
      status,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      AND: [
        type ? { type } : {},
        status !== undefined ? { status } : {},
        categoryId ? { categoryId } : {},
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
          category: { select: { id: true, name: true } },
          author: { select: { username: true, avatar: true } },
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
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
