import { UploadService } from './upload.service';
export declare class UploadController {
    private upload;
    constructor(upload: UploadService);
    uploadImages(files: Express.Multer.File[]): Promise<{
        url: string;
        urls: string[];
    } | {
        urls: string[];
        url?: undefined;
    }>;
}
