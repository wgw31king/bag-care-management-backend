import { Module } from '@nestjs/common';
import { ManagerGuard } from '../common/guards/manager.guard';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  controllers: [StaffController],
  providers: [StaffService, ManagerGuard],
})
export class StaffModule {}
