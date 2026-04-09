import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { VaultService } from './vault.service';
import { Request as ExpressRequest } from 'express';

@Controller('public/vault')
export class PublicVaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('bookmarks')
  findAll(
    @Query('search') search?: string,
    @Query('tagIds') tagIds?: string,
    @Query('sort') sort?: 'latest' | 'hottest',
  ) {
    const parsedTagIds = tagIds
      ? tagIds.split(',').map((id) => parseInt(id))
      : undefined;
    return this.vaultService.findAllBookmarks(undefined, {
      search,
      tagIds: parsedTagIds,
      sort,
    });
  }

  @Get('tags')
  findAllTags() {
    return this.vaultService.findAllTags();
  }

  @Patch('bookmarks/:id/click')
  incrementClicks(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: ExpressRequest,
  ) {
    const ip = req.ip || req.get('x-forwarded-for') || '';
    const ua = req.get('user-agent') || '';
    return this.vaultService.incrementClicks(id, { ip, ua });
  }
}
