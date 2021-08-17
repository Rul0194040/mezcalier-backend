import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AvatarController } from './avatar.controller';

/**
 * Módulo de avatar
 */
@Module({
  imports: [UsersModule],
  controllers: [AvatarController],
  providers: [],
})
export class AvatarModule {}
