export declare class CreateOrderDto {
    customerName: string;
    phone: string;
    wechatNote?: string;
    brand: string;
    style: string;
    color: string;
    material: string;
    defectDesc: string;
    defectImages?: string[];
    washServices: string[];
    orderTime: string;
    expectPickupTime: string;
    amount: number;
    prepay: number;
    remark?: string;
    status?: string;
}
