import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameSyncService } from './game-sync.service';
import { GameController } from './game.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GameController],
  providers: [GameService, GameSyncService, PrismaService],
  exports: [GameService, GameSyncService],
})
export class GameModule {}
