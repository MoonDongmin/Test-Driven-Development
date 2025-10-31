import {NestFactory}       from "@nestjs/core";
import {AppModule}         from "@/app.module";
import {BigintInterceptor} from "@/commerce/api.controller/bigint.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(
    new BigintInterceptor(),
  );
  await app.listen(process.env.PORT ?? 8080);
}

bootstrap();
