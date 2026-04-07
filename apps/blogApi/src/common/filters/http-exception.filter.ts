import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  message?: string | string[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const res = exception.getResponse() as ErrorResponse;

    response.status(status).json({
      code: status,
      message:
        (Array.isArray(res.message) ? res.message[0] : res.message) ||
        exception.message ||
        'Internal Server Error',
      data: null,
    });
  }
}
