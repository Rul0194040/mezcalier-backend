import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { UsersController } from '@mezcal/modules/admin/users/users.controller';
import { UsersService } from '@mezcal/modules/admin/users/users.service';
import { MyLogger } from '@mezcal/common/services/logger.service';
import { EmailSenderService } from '@mezcal/common/services/email-sender.service';
import { ProfileEntity } from '@mezcal/modules/admin/profiles/model/profile.entity';
import { HouseEntity } from '@mezcal/modules/house.entity';
import { ProfilesService } from '../profiles/profiles.service';
/**
 * Módulo de usuarios
 */

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([HouseEntity]),
    TypeOrmModule.forFeature([ProfileEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService, MyLogger, EmailSenderService, ProfilesService],
  exports: [
    UsersService,
    ProfilesService,
    EmailSenderService,
    TypeOrmModule.forFeature([ProfileEntity]),
  ],
})
export class UsersModule {}
