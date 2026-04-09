import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/auth.guard';
import { Response } from 'express';

interface AnalyticsQuery {
  search?: string;
  type?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('logs')
  async getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query() query: AnalyticsQuery,
  ) {
    return this.analyticsService.getLogs(
      Number(page) || 1,
      Number(limit) || 20,
      query,
    );
  }

  /**
   * 导出接口：显式使用 @Res 且不通过 return 语句
   * NestJS 看到 @Res() 装饰器且方法不返回数据时，会自动跳过全局的 TransformInterceptor
   */
  @Get('export')
  async exportLogs(@Res() res: Response, @Query() query: AnalyticsQuery) {
    await this.analyticsService.exportLogsToCsv(res, query);
    // 这里严禁 return，防止被 TransformInterceptor 二次包装导致服务异常
  }

  @Get('summary')
  async getSummary() {
    return this.analyticsService.getSummary();
  }
}
