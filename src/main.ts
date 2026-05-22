import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const port = Number(process.env.PORT ?? 3001);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
    ],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );

  const uploadDir = process.env.UPLOAD_DIR ?? 'uploads';
  app.useStaticAssets(join(process.cwd(), uploadDir), { prefix: '/uploads' });

  const frontendDist = process.env.FRONTEND_DIST;
  if (frontendDist) {
    const abs = join(process.cwd(), frontendDist);
    if (existsSync(join(abs, 'index.html'))) {
      app.useStaticAssets(abs);
      app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          return next();
        }
        const p = req.path;
        if (p.startsWith('/api') || p.startsWith('/uploads')) {
          return next();
        }
        return res.sendFile(join(abs, 'index.html'));
      });
      console.log(`Frontend static: ${abs}`);
    }
  }

  await app.listen(port);
  console.log(`Bag Wash running at http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/api`);
}
bootstrap();
