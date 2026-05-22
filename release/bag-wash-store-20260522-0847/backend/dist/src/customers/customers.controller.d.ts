import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private customers;
    constructor(customers: CustomersService);
    findAll(query: QueryCustomerDto): Promise<{
        list: {
            id: string;
            name: string;
            phone: string;
            wechat: string;
            tag: string;
            remark: string;
            orderCount: number;
            lastVisit: string | null;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        phone: string;
        wechat: string;
        tag: string;
        remark: string;
        orderCount: number;
        lastVisit: string | null;
    }>;
    create(dto: CreateCustomerDto): Promise<{
        id: string;
        name: string;
        phone: string;
        wechat: string;
        tag: string;
        remark: string;
        orderCount: number;
        lastVisit: string | null;
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<{
        id: string;
        name: string;
        phone: string;
        wechat: string;
        tag: string;
        remark: string;
        orderCount: number;
        lastVisit: string | null;
    }>;
    remove(id: string): Promise<null>;
}
