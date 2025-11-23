import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix("");
  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`Schedule service running on http://localhost:${port}`);
}

bootstrap();
