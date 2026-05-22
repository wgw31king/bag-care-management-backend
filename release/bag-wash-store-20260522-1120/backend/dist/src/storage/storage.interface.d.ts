export declare const STORAGE_PROVIDER = "STORAGE_PROVIDER";
export interface StorageProvider {
    save(file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }): Promise<string>;
}
