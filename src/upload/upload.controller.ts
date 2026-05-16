import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { UploadService } from './upload.service';

@Controller('upload')
@RequirePermissions('order')
export class UploadController {
  constructor(private upload: UploadService) {}

  @Post('images')
  @UseInterceptors(
    FilesInterceptor('file', 9, {
      storage: memoryStorage(),
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.upload.saveImages(files);
  }
}
