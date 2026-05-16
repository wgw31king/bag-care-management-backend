import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER } from '../storage/storage.interface';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILES = 9;

@Injectable()
export class UploadService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private storage: { save: (file: { buffer: Buffer; originalname: string; mimetype: string }) => Promise<string> },
    private config: ConfigService,
  ) {}

  async saveImages(files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new BadRequestException('请选择至少一张图片');
    }
    if (files.length > MAX_FILES) {
      throw new BadRequestException(`单次最多上传 ${MAX_FILES} 张图片`);
    }

    const maxBytes =
      Number(this.config.get('MAX_UPLOAD_SIZE_MB', 5)) * 1024 * 1024;

    const urls: string[] = [];
    for (const file of files) {
      if (!ALLOWED_MIME.has(file.mimetype)) {
        throw new BadRequestException('仅支持 jpeg/png/webp 图片');
      }
      if (file.size > maxBytes) {
        throw new BadRequestException(
          `单张图片不能超过 ${this.config.get('MAX_UPLOAD_SIZE_MB', 5)}MB`,
        );
      }
      const url = await this.storage.save({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      });
      urls.push(url);
    }

    if (urls.length === 1) {
      return { url: urls[0], urls };
    }
    return { urls };
  }
}
