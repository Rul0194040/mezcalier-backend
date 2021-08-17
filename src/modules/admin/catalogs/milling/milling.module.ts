import { Module } from '@nestjs/common';
import { MillingController } from './milling.controller';
import { MillingService } from './milling.service';

@Module({
  imports: [],
  controllers: [MillingController],
  providers: [MillingService],
  exports: [MillingService],
})
export class MillingModule {}
