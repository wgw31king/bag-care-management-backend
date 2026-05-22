import { Decimal } from '@prisma/client/runtime/library';
export declare function decimalToNumber(value: Decimal | number | string): number;
export declare function toOrderJson<T extends {
    amount: unknown;
    prepay: unknown;
    createdAt: bigint;
}>(order: T): T & {
    amount: number;
    prepay: number;
    createdAt: number;
    defectImages: {};
    washServices: {};
};
export declare function toWashServiceJson<T extends {
    price: unknown;
    code?: string | null;
}>(row: T): T & {
    code: string | null;
    price: number;
};
