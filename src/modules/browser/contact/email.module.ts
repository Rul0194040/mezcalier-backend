import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { Module } from '@nestjs/common';
import { EmailSenderService } from '@mezcal/common/services/email-sender.service';
import { MyLogger } from '@mezcal/common/services/logger.service';

@Module({
  imports: [],
  controllers: [EmailController],
  providers: [EmailService, EmailSenderService, MyLogger],
  exports: [EmailService],
})
export class EmailModule {}
