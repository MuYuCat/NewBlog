import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { AuthGuard } from '../auth/auth.guard';
import { Menu } from '@prisma/client';

@Controller('menu')
@UseGuards(AuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('tree')
  async getTree() {
    return this.menuService.getTree();
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body()
    data: {
      name: string;
      path: string;
      icon?: string;
      i18nKey?: string;
      parentId?: number;
      order?: number;
      type?: number;
    },
  ) {
    return this.menuService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Menu>) {
    return this.menuService.update(Number(id), data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.menuService.remove(Number(id));
  }

  @Post('sort')
  @HttpCode(200)
  async updateOrder(@Body() data: { id: number; order: number }[]) {
    return this.menuService.updateOrder(data);
  }
}
