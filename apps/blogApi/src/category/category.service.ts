import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { articles: true },
    });
    if (!category) throw new NotFoundException('分类未找到');
    return category;
  }

  async create(data: { name: string; slug: string; order?: number }) {
    return this.prisma.category.create({ data });
  }

  async update(
    id: number,
    data: { name?: string; slug?: string; order?: number },
  ) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    // 检查分类下是否有文章，防止级联误删
    const count = await this.prisma.article.count({
      where: {
        categories: {
          some: { id },
        },
      },
    });
    if (count > 0) throw new Error('该分类下仍有文章，无法删除');
    return this.prisma.category.delete({ where: { id } });
  }
}
