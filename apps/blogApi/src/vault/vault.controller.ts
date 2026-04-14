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
import { JwtService } from '@nestjs/jwt';

@Controller('vault')
export class VaultController {
  constructor(
    private readonly vaultService: VaultService,
    private readonly jwtService: JwtService,
  ) {}

  // --- 资源 (Bookmarks) 接口 ---

  @Get('bookmarks')
  async findAllBookmarks(
    @Request() req,
    @Query('search') search?: string,
    @Query('tagIds') tagIds?: string,
    @Query('sort') sort?: 'latest' | 'hottest',
  ) {
    const parsedTagIds = tagIds
      ? tagIds.split(',').map((id) => parseInt(id))
      : undefined;

    // 手动解析身份判定 isAdmin
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

    return this.vaultService.findAllBookmarks(
      isAdmin ? req.user?.sub : undefined,
      {
        search,
        tagIds: parsedTagIds,
        sort,
      },
    );
  }

  @Patch('bookmarks/:id/click')
  clickBookmark(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.vaultService.incrementClicks(id, {
      ip:
        req.ip ||
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress,
      ua: req.headers['user-agent'],
    });
  }

  @Post('bookmarks')
  @UseGuards(AuthGuard)
  createBookmark(@Request() req, @Body() data: CreateBookmarkDto) {
    return this.vaultService.createBookmark(req.user.sub, data);
  }

  @Patch('bookmarks/:id')
  @UseGuards(AuthGuard)
  updateBookmark(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: CreateBookmarkDto,
  ) {
    return this.vaultService.updateBookmark(id, req.user.sub, data);
  }

  @Delete('bookmarks/:id')
  @UseGuards(AuthGuard)
  deleteBookmark(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.vaultService.deleteBookmark(id, req.user.sub);
  }

  // --- 标签 (Tags) 接口 ---

  @Get('tags')
  findAllTags() {
    return this.vaultService.findAllTags();
  }

  @Post('tags')
  @UseGuards(AuthGuard)
  createTag(@Body() data: CreateTagDto) {
    return this.vaultService.createTag(data);
  }

  @Patch('tags/:id')
  @UseGuards(AuthGuard)
  updateTag(@Param('id', ParseIntPipe) id: number, @Body() data: CreateTagDto) {
    return this.vaultService.updateTag(id, data);
  }

  @Delete('tags/:id')
  @UseGuards(AuthGuard)
  deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.vaultService.deleteTag(id);
  }
}
