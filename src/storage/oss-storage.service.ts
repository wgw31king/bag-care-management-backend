import { Injectable, NotImplementedException } from '@nestjs/common';
import { StorageProvider } from './storage.interface';

/**
 * 生产环境 OSS（阿里云/MinIO）占位实现。
 * 配置 STORAGE_DRIVER=oss 并实现 save() 后接入实际上传 SDK。
 */
@Injectable()
export class OssStorageService implements StorageProvider {
  async save(): Promise<string> {
    throw new NotImplementedException(
      'OSS 存储未配置，请实现 OssStorageService 或设置 STORAGE_DRIVER=local',
    );
  }
}
