import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { stringify } from 'csv-stringify';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private buildWhereClause(query: {
    search?: string;
    type?: string;
    status?: string;
    startTime?: string;
    endTime?: string;
  }) {
    const where: Prisma.AuditLogWhereInput = { AND: [] };
    const andArray = where.AND as Prisma.AuditLogWhereInput[];

    if (query.search) {
      andArray.push({
        OR: [
          { path: { contains: query.search } },
          { ip: { contains: query.search } },
          { location: { contains: query.search } },
        ],
      });
    }

    if (query.type) {
      const types = query.type.split(',');
      andArray.push({ logType: { in: types } });
    }

    if (query.status === 'success') {
      andArray.push({ status: { lt: 400 } });
    } else if (query.status === 'error') {
      andArray.push({ status: { gte: 400 } });
    }

    if (query.startTime && query.endTime) {
      andArray.push({
        createdAt: {
          gte: new Date(query.startTime),
          lte: new Date(query.endTime),
        },
      });
    }

    return andArray.length > 0 ? where : {};
  }

  async getLogs(
    page = 1,
    limit = 20,
    query: {
      search?: string;
      type?: string;
      status?: string;
      startTime?: string;
      endTime?: string;
    },
  ) {
    const where = this.buildWhereClause(query);

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  // 高性能流式导出 CSV
  async exportLogsToCsv(
    res: Response,
    query: {
      search?: string;
      type?: string;
      status?: string;
      startTime?: string;
      endTime?: string;
    },
  ) {
    // 设置 HTTP Header 告知浏览器这是个文件流
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=audit-logs-${Date.now()}.csv`,
    );

    const where = this.buildWhereClause(query);

    const stringifier = stringify({
      header: true,
      columns: [
        { key: 'id', header: 'ID' },
        { key: 'logType', header: '类型' },
        { key: 'method', header: '方法' },
        { key: 'status', header: '状态' },
        { key: 'path', header: '路径' },
        { key: 'ip', header: 'IP' },
        { key: 'location', header: '地理位置' },
        { key: 'duration', header: '耗时(ms)' },
        { key: 'createdAt', header: '创建时间' },
      ],
    });

    // 管道连接：Stringifier -> Response
    stringifier.pipe(res);

    // 分块读取数据库，防止内存溢出
    let skip = 0;
    const batchSize = 1000;

    while (true) {
      const logs = await this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: batchSize,
        skip: skip,
      });

      if (logs.length === 0) break;

      for (const log of logs) {
        stringifier.write({
          ...log,
          createdAt: log.createdAt.toISOString(),
        });
      }

      skip += batchSize;
      // 释放 CPU 时间片，允许其他请求处理
      await new Promise((resolve) => setImmediate(resolve));
    }

    stringifier.end();
  }

  async getSummary() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [pv, uv, errors] = await Promise.all([
      this.prisma.auditLog.count({
        where: {
          createdAt: { gte: todayStart },
          logType: 'PAGE_WEB',
        },
      }),
      this.prisma.auditLog.groupBy({
        by: ['ip'],
        where: {
          createdAt: { gte: todayStart },
          logType: 'PAGE_WEB',
        },
      }),
      this.prisma.auditLog.count({
        where: {
          createdAt: { gte: todayStart },
          status: { gte: 400 },
        },
      }),
    ]);

    return { pv, uv: uv.length, errors };
  }
}
