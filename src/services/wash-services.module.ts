import { Module } from '@nestjs/common';
import { WashServicesController } from './wash-services.controller';
import { WashServicesService } from './wash-services.service';

@Module({
  controllers: [WashServicesController],
  providers: [WashServicesService],
})
export class WashServicesModule {}
