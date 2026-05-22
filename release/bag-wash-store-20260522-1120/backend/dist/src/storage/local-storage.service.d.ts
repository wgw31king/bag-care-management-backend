import { ConfigService } from '@nestjs/config';
import { StorageProvider } from './storage.interface';
export declare class LocalStorageService implements StorageProvider {
    private uploadDir;
    private publicBaseUrl;
    constructor(config: ConfigService);
    save(file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }): Promise<string>;
    private extFromMime;
}
