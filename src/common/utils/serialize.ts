import { Decimal } from '@prisma/client/runtime/library';

export function decimalToNumber(value: Decimal | number | string): number {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  return Number(value);
}

export function toOrderJson<T extends { amount: unknown; prepay: unknown; createdAt: bigint }>(
  order: T,
) {
  return {
    ...order,
    amount: decimalToNumber(order.amount as Decimal),
    prepay: decimalToNumber(order.prepay as Decimal),
    createdAt: Number(order.createdAt),
    defectImages: (order as { defectImages?: unknown }).defectImages ?? [],
    washServices: (order as { washServices?: unknown }).washServices ?? [],
  };
}

export function toWashServiceJson<T extends { price: unknown; code?: string | null }>(
  row: T,
) {
  return {
    ...row,
    code: row.code ?? null,
    price: decimalToNumber(row.price as Decimal),
  };
}
