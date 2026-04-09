import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBookmarkDto, CreateTagDto } from '@newblog/validation';

@Injectable()
export class VaultService {
  constructor(private prisma: PrismaService) {}

  // --- Bookmark 业务 ---

  async findAllBookmarks(
    userId: number,
    query?: { search?: string; tagIds?: number[] },
  ) {
    const { search, tagIds } = query || {};
    return this.prisma.bookmark.findMany({
      where: {
        userId,
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { description: { contains: search } },
                  { url: { contains: search } },
                ],
              }
            : {},
          tagIds && tagIds.length > 0
            ? {
                tags: {
                  some: { id: { in: tagIds } },
                },
              }
            : {},
        ],
      },
      include: {
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBookmark(userId: number, data: CreateBookmarkDto) {
    const { tagIds, ...rest } = data;
    return this.prisma.bookmark.create({
      data: {
        ...rest,
        userId,
        tags: {
          connect: tagIds?.map((id) => ({ id })) || [],
        },
      },
      include: { tags: true },
    });
  }

  async updateBookmark(id: number, userId: number, data: CreateBookmarkDto) {
    const { tagIds, ...rest } = data;
    // 检查权限
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id, userId },
    });
    if (!bookmark) throw new NotFoundException('资源未找到或无权操作');

    return this.prisma.bookmark.update({
      where: { id },
      data: {
        ...rest,
        tags: {
          set: tagIds?.map((id) => ({ id })) || [],
        },
      },
      include: { tags: true },
    });
  }

  async deleteBookmark(id: number, userId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id, userId },
    });
    if (!bookmark) throw new NotFoundException('资源未找到或无权操作');
    return this.prisma.bookmark.delete({ where: { id } });
  }

  // --- Tag 业务 ---

  async findAllTags() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createTag(data: CreateTagDto) {
    return this.prisma.tag.create({ data });
  }

  async updateTag(id: number, data: CreateTagDto) {
    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  async deleteTag(id: number) {
    return this.prisma.tag.delete({ where: { id } });
  }
}
