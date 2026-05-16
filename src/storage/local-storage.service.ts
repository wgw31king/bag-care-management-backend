import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { StorageProvider } from './storage.interface';

@Injectable()
export class LocalStorageService implements StorageProvider {
  private uploadDir: string;
  private publicBaseUrl: string;

  constructor(config: ConfigService) {
    this.uploadDir = join(process.cwd(), config.get('UPLOAD_DIR', 'uploads'));
    this.publicBaseUrl = config.get('PUBLIC_BASE_URL', '').replace(/\/$/, '');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async save(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }): Promise<string> {
    const ext = extname(file.originalname) || this.extFromMime(file.mimetype);
    const filename = `${randomUUID()}${ext}`;
    writeFileSync(join(this.uploadDir, filename), file.buffer);
    const path = `/uploads/${filename}`;
    return this.publicBaseUrl ? `${this.publicBaseUrl}${path}` : path;
  }

  private extFromMime(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    return map[mime] ?? '.jpg';
  }
}
