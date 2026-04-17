import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { GameService } from './game.service';
import { GameSyncService } from './game-sync.service';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly gameSyncService: GameSyncService,
  ) {}

  // ... 现有 findAll ...

  @Post('sync')
  async triggerSync() {
    return this.gameSyncService.manualSync();
  }

  @Get('last-sync')
  async getLastSync() {
    return this.gameService.getSyncState();
  }

  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.gameService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
      status: status ? parseInt(status) : undefined,
    });
  }

  @Get('config')
  async getSyncConfig() {
    return this.gameService.getSyncConfig();
  }

  @Post('config')
  async updateSyncConfig(@Body() body: { platform: string; config: any }) {
    return this.gameService.updateSyncConfig(body.platform, body.config);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.gameService.create(data);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.gameService.update(id, data);
  }

  @Post('merge')
  async mergePlatform(
    @Body() body: { sourcePlatformId: number; targetGameId: number },
  ) {
    return this.gameService.mergePlatform(
      body.sourcePlatformId,
      body.targetGameId,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.gameService.remove(id);
  }
}
