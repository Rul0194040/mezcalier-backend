import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileEntity } from '@mezcal/modules/admin/profiles/model/profile.entity';
import { ProfilesController } from '@mezcal/modules/admin/profiles/profiles.controller';
import { ProfilesService } from '@mezcal/modules/admin/profiles/profiles.service';
import { MyLogger } from '@mezcal/common/services/logger.service';
/**
 * Módulo para profiles
 */
@Module({
  imports: [TypeOrmModule.forFeature([ProfileEntity])],
  controllers: [ProfilesController],
  providers: [ProfilesService, MyLogger],
  exports: [ProfilesService],
})
export class ProfilesModule {}
