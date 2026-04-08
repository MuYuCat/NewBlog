import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Menu } from '@prisma/client';

export interface MenuNode extends Menu {
  children?: MenuNode[];
}

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // 获取树形结构
  async getTree(): Promise<MenuNode[]> {
    const menus = await this.prisma.menu.findMany({
      orderBy: { order: 'asc' },
    });

    // 组装树形结构的递归函数
    const buildTree = (parentId: number | null = null): MenuNode[] => {
      return menus
        .filter((item) => item.parentId === parentId)
        .map((item) => ({
          ...item,
          children: buildTree(item.id),
        }));
    };

    return buildTree();
  }

  // 创建菜单
  async create(data: {
    name: string;
    path: string;
    icon?: string;
    i18nKey?: string;
    parentId?: number;
    order?: number;
    type?: number;
  }) {
    return this.prisma.menu.create({
      data: {
        ...data,
        parentId: data.parentId || null,
        order: data.order || 0,
        type: data.type || 1,
        status: 1,
      },
    });
  }

  // 更新菜单
  async update(id: number, data: Partial<Menu>) {
    return this.prisma.menu.update({
      where: { id },
      data,
    });
  }

  // 删除菜单 (级联删除子菜单)
  async remove(id: number) {
    return this.prisma.menu.delete({
      where: { id },
    });
  }

  // 批量更新排序
  async updateOrder(data: { id: number; order: number }[]) {
    return Promise.all(
      data.map((item) =>
        this.prisma.menu.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    );
  }
}
