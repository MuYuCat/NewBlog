import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { VaultController } from './vault.controller';
import { VaultService } from './vault.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'muyucat-default-secret-key-2026',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [VaultController],
  providers: [VaultService, PrismaService],
})
export class VaultModule {}
