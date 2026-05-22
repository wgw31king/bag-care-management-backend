import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ManagerGuard } from '../common/guards/manager.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { CreateStaffDto } from './dto/create-staff.dto';
import { QueryStaffDto } from './dto/query-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffService } from './staff.service';

@Controller('staff')
@UseGuards(ManagerGuard)
export class StaffController {
  constructor(private staff: StaffService) {}

  @Get()
  findAll(@Query() query: QueryStaffDto) {
    return this.staff.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staff.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.staff.create(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @Req() req: Request & { user: JwtPayload },
  ) {
    return this.staff.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staff.remove(id);
  }
}
