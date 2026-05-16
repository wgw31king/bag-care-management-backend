import { PartialType } from '@nestjs/mapped-types';
import { CreateWashServiceDto } from './create-wash-service.dto';

export class UpdateWashServiceDto extends PartialType(CreateWashServiceDto) {}
