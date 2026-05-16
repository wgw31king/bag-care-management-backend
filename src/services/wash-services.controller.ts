import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CreateWashServiceDto } from './dto/create-wash-service.dto';
import { QueryWashServiceDto } from './dto/query-wash-service.dto';
import { UpdateWashServiceDto } from './dto/update-wash-service.dto';
import { WashServicesService } from './wash-services.service';

@Controller('services')
@RequirePermissions('service')
export class WashServicesController {
  constructor(private services: WashServicesService) {}

  @Get()
  findAll(@Query() query: QueryWashServiceDto) {
    return this.services.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.services.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWashServiceDto) {
    return this.services.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWashServiceDto) {
    return this.services.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.services.remove(id);
  }
}
