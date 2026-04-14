import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('article')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async findAll(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryIds') categoryIds?: string, // 接收逗号分隔或单个
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const parsedCategoryIds = categoryIds
      ? categoryIds.split(',').map((id) => parseInt(id))
      : undefined;

    // 手动尝试解析身份，以支持公开/管理 混合视图
    let isAdmin = false;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET || 'muyucat-default-secret-key-2026',
        });
        isAdmin = !!payload;
      } catch (e) {
        isAdmin = false;
      }
    }

    return this.articleService.findAll(
      {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        search,
        categoryIds: parsedCategoryIds,
        status: status ? parseInt(status) : undefined,
        startDate,
        endDate,
      },
      isAdmin,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.findOne(id);
  }

  @Patch(':id/click')
  click(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.incrementClicks(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Req() req, @Body() data: any) {
    return this.articleService.create(req.user.sub, data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.articleService.update(id, req.user.sub, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.remove(id);
  }
}
