import { Module } from '@nestjs/common';
import { SuscriptionService } from '@mezcal/modules/browser/suscription/suscription.service';
import { SuscriptionController } from '@mezcal/modules/browser/suscription/suscription.controller';
import { ProfilesService } from '@mezcal/modules/admin/profiles/profiles.service';
import { HousesService } from '@mezcal/modules/owner/houses/houses.service';
import { UsersService } from '@mezcal/modules/admin/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity } from '@mezcal/modules/admin/profiles/model/profile.entity';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { EmailSenderService } from '@mezcal/common/services/email-sender.service';
import { MyLogger } from '@mezcal/common/services/logger.service';

/**
 * Modulo para suscripciones, acceso publico
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileEntity]),
    TypeOrmModule.forFeature([HouseEntity]),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [SuscriptionController],
  providers: [
    SuscriptionService,
    ProfilesService,
    HousesService,
    UsersService,
    EmailSenderService,
    MyLogger,
  ],
  exports: [SuscriptionService],
})
export class SuscriptionModule {}
