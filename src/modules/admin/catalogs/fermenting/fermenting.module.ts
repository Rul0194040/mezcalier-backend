import { Module } from '@nestjs/common';
import { FermentingController } from './fermenting.controller';
import { FermentingService } from './fermenting.service';

@Module({
  imports: [],
  controllers: [FermentingController],
  providers: [FermentingService],
  exports: [FermentingService],
})
export class FermentingModule {}
