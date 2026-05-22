import { StorageProvider } from './storage.interface';
export declare class OssStorageService implements StorageProvider {
    save(): Promise<string>;
}
