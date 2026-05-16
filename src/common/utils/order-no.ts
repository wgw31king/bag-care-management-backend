export function generateOrderNo(): string {
  return `BW${Date.now().toString().slice(-10)}`;
}
