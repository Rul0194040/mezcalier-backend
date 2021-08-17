import { Module } from '@nestjs/common';
import { AdminHousesController } from './admonHouses.controller';
import { HousesService } from '../../owner/houses/houses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseEntity } from '../../house.entity';
import { UserEntity } from '../users/model/user.entity';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([HouseEntity, UserEntity]), UsersModule],
  providers: [HousesService, UsersService],
  controllers: [AdminHousesController],
  exports: [HousesService],
})
export class HousesModule {}
