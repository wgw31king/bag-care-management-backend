export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

/** 对象存储抽象：开发环境本地磁盘，生产可切换 OSS/MinIO */
export interface StorageProvider {
  save(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }): Promise<string>;
}
