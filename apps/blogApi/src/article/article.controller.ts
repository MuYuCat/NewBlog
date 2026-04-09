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

@Controller('article')
@UseGuards(AuthGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.articleService.findAll({
      search,
      type,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      status: status ? parseInt(status) : undefined,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.findOne(id);
  }

  @Post()
  create(@Req() req, @Body() data: any) {
    return this.articleService.create(req.user.sub, data);
  }

  @Patch(':id')
  update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.articleService.update(id, req.user.sub, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.remove(id);
  }
}
