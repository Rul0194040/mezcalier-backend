import { Module } from '@nestjs/common';
import { CloudvisionService } from './cloudvision.service';

@Module({
  providers: [CloudvisionService],
})
export class CloudvisionModule {}
