import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

@Injectable()
export class FilesService {
  private uploadDir: string;

  constructor(config: ConfigService) {
    this.uploadDir = join(process.cwd(), config.get('UPLOAD_DIR', 'uploads'));
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  saveImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择文件');
    }
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('仅支持 jpeg/png/gif/webp 图片');
    }
    const maxMb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 5);
    if (file.size > maxMb * 1024 * 1024) {
      throw new BadRequestException(`文件不能超过 ${maxMb}MB`);
    }
    const ext = extname(file.originalname) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    writeFileSync(join(this.uploadDir, filename), file.buffer);
    return { url: `/uploads/${filename}` };
  }
}
