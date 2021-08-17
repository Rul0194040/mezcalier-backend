import { Module } from '@nestjs/common';
import { DistillingController } from './distilling.controller';
import { DistillingService } from './distilling.service';

@Module({
  imports: [],
  controllers: [DistillingController],
  providers: [DistillingService],
  exports: [DistillingService],
})
export class DistillingModule {}
