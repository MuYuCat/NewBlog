import { Controller, Get } from '@nestjs/common';
import { MenuService, MenuNode } from './menu.service';

@Controller('public-menu')
export class PublicMenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('tree')
  async getTree(): Promise<MenuNode[]> {
    const tree = await this.menuService.getTree();

    // 过滤掉未启用的菜单，仅返回给前台展示
    const filterActive = (list: MenuNode[]): MenuNode[] => {
      return list
        .filter((item) => item.status === 1)
        .map((item) => ({
          ...item,
          children: item.children ? filterActive(item.children) : [],
        }));
    };

    return filterActive(tree);
  }
}
