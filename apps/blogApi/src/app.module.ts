import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { AnalyticsModule } from './analytics/analytics.module';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { VaultModule } from './vault/vault.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/', // 基础路径，访问 uploads 则是 /uploads
    }),
    AuthModule,
    MenuModule,
    AnalyticsModule,
    VaultModule,
    ArticleModule,
    CategoryModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
