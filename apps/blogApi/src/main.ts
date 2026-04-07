import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册全局拦截器：统一成功返回格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // 注册全局过滤器：统一异常返回格式
  app.useGlobalFilters(new HttpExceptionFilter());

  // 允许跨域
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Failed to start the application:', err);
});
