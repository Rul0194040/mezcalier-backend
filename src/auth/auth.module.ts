import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '@mezcal/auth/auth.service';
import { LocalStrategy } from '@mezcal/auth/guards/local/local.strategy';
import { JwtStrategy } from '@mezcal/auth/guards/jwt/jwt.strategy';
import { UsersService } from '@mezcal/modules/admin/users/users.service';
import { UsersModule } from '@mezcal/modules/admin/users/users.module';
import { AuthController } from '@mezcal/auth/auth.controller';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ConfigKeys } from '@mezcal/common/enum/configkeys.enum';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacebookStrategy } from '@mezcal/auth/guards/facebook/facebook.strategy';
import { GoogleStrategy } from './guards/google/google.strategy';

/**
 * Aquí tambien podemos documentar.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]), //inyectamos este en donde queramos usar ese mismo service UserEntity->UsersService
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (_configService: ConfigService) => ({
        secret: _configService.get(ConfigKeys.JWT_SECRET),
        signOptions: {
          expiresIn: _configService.get(ConfigKeys.JWT_EXPIRATION),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    LocalStrategy,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
    AuthService,
    UsersService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
