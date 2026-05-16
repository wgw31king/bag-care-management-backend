import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { OssStorageService } from './oss-storage.service';
import { STORAGE_PROVIDER, StorageProvider } from './storage.interface';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LocalStorageService,
    OssStorageService,
    {
      provide: STORAGE_PROVIDER,
      inject: [ConfigService, LocalStorageService, OssStorageService],
      useFactory: (
        config: ConfigService,
        local: LocalStorageService,
        oss: OssStorageService,
      ): StorageProvider => {
        const driver = config.get('STORAGE_DRIVER', 'local');
        return driver === 'oss' ? oss : local;
      },
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
