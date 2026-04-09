import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { VaultService } from './vault.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateBookmarkDto, CreateTagDto } from '@newblog/validation';

@Controller('vault')
@UseGuards(AuthGuard)
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  // --- 书签接口 ---

  @Get('bookmarks')
  findAllBookmarks(
    @Request() req,
    @Query('search') search?: string,
    @Query('tagIds') tagIds?: string,
  ) {
    const parsedTagIds = tagIds
      ? tagIds.split(',').map((id) => parseInt(id))
      : undefined;
    return this.vaultService.findAllBookmarks(req.user.sub, {
      search,
      tagIds: parsedTagIds,
    });
  }

  @Post('bookmarks')
  createBookmark(@Request() req, @Body() data: CreateBookmarkDto) {
    return this.vaultService.createBookmark(req.user.sub, data);
  }

  @Patch('bookmarks/:id')
  updateBookmark(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateBookmarkDto,
  ) {
    return this.vaultService.updateBookmark(id, req.user.sub, data);
  }

  @Delete('bookmarks/:id')
  deleteBookmark(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.vaultService.deleteBookmark(id, req.user.sub);
  }

  // --- 标签接口 ---

  @Get('tags')
  findAllTags() {
    return this.vaultService.findAllTags();
  }

  @Post('tags')
  createTag(@Body() data: CreateTagDto) {
    return this.vaultService.createTag(data);
  }

  @Patch('tags/:id')
  updateTag(@Param('id', ParseIntPipe) id: number, @Body() data: CreateTagDto) {
    return this.vaultService.updateTag(id, data);
  }

  @Delete('tags/:id')
  deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.vaultService.deleteTag(id);
  }
}
