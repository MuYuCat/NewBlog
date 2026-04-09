import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma.service';
import * as geoip from 'geoip-lite';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface RequestWithUser extends Request {
  user?: { sub: string | number; [key: string]: unknown };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithUser>();
    const { method, url } = request;
    const body = request.body as unknown;
    const query = request.query as unknown;
    const startTime = Date.now();

    // 获取 IP
    const ip =
      (request.headers['x-forwarded-for'] as string) ||
      request.socket.remoteAddress ||
      request.ip ||
      'unknown';

    // 解析地理位置
    const geo = geoip.lookup(ip);
    let location = '未知';
    if (geo) {
      location = `${geo.country} ${geo.region} ${geo.city}`.trim();
    } else if (ip === '::1' || ip === '127.0.0.1') {
      location = '本地访问';
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = http.getResponse<Response>();
          void this.log(
            method,
            url,
            response.statusCode,
            startTime,
            ip,
            location,
            request,
            body,
            query,
          );
        },
        error: (error: unknown) => {
          const statusCode = (error as { status?: number })?.status || 500;
          void this.log(
            method,
            url,
            statusCode,
            startTime,
            ip,
            location,
            request,
            body,
            query,
          );
        },
      }),
    );
  }

  private async log(
    method: string,
    path: string,
    status: number,
    startTime: number,
    ip: string,
    location: string,
    request: RequestWithUser,
    body: unknown,
    query: unknown,
  ) {
    const duration = Date.now() - startTime;
    const userAgent = request.headers['user-agent'];
    const userId = request.user?.sub;

    // 识别日志类型：优先从请求头获取，默认为 API
    const logType = (request.headers['x-log-type'] as string) || 'API';

    try {
      // 异步记录，不阻塞响应
      await this.prisma.auditLog.create({
        data: {
          logType,
          method,
          path,
          status,
          ip: String(ip),
          location,
          duration,
          userAgent,
          body:
            body && typeof body === 'object' && Object.keys(body).length > 0
              ? (body as Prisma.InputJsonValue)
              : Prisma.JsonNull,
          query:
            query && typeof query === 'object' && Object.keys(query).length > 0
              ? (query as Prisma.InputJsonValue)
              : Prisma.JsonNull,
          userId: userId ? Number(userId) : undefined,
        },
      });
    } catch (e) {
      console.error('[LoggingInterceptor] Failed to save audit log:', e);
    }
  }
}
