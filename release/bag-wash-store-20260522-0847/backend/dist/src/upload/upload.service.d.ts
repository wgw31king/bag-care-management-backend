import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private storage;
    private config;
    constructor(storage: {
        save: (file: {
            buffer: Buffer;
            originalname: string;
            mimetype: string;
        }) => Promise<string>;
    }, config: ConfigService);
    saveImages(files: Express.Multer.File[]): Promise<{
        url: string;
        urls: string[];
    } | {
        urls: string[];
        url?: undefined;
    }>;
}
