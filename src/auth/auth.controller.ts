/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller,
  Post,
  UseGuards,
  Body,
  Request,
  Get,
} from '@nestjs/common';
import { LocalAuthGuard } from '@mezcal/auth/guards/local/local-auth.guard';
import { AuthService } from '@mezcal/auth/auth.service';
import { LoginDTO } from '@mezcal/auth/dto/login.dto';
import { LoginResponseDTO } from '@mezcal/auth/dto/loginresponse.dto';
import {
  ApiUnauthorizedResponse,
  ApiTags,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@mezcal/auth/guards/jwt/jwt-auth.guard';
import { PingResponseDTO } from '@mezcal/auth/dto/pingresponse.dto';
import { UsersService } from '@mezcal/modules/admin/users/users.service';
import { User } from '@mezcal/modules/admin/users/user.decorator';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { RateLimit } from 'nestjs-rate-limiter';
/**
 * Encargado de la autenticación del usuario.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /**
   * @ignore
   */
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}
  /**
   * Ruta de inicialización.
   *
   * *Todos estos comentarios* deben ir antes de los decoradores.
   *
   * @param {LoginDTO} body Cuerpo de la solicitud
   * @param req {Req extraido para obtener o inyectar el usuario}
   */

  @ApiOperation({
    summary: 'Inicio de sesión, no debe permitir inicio de usuarios inactivos.',
  })
  @UseGuards(LocalAuthGuard) //solo visible cuando lleva un user (puesto ahi por passport, extraido del body)
  @Post('login')
  @ApiBody({
    type: LoginDTO,
    description: 'La solicitud debe incluir <email> y <password> en el body.',
  })
  @ApiCreatedResponse({
    type: LoginResponseDTO,
    description: 'El usuario ha iniciado sesión.',
  })
  @ApiUnauthorizedResponse({
    description: 'Las credenciales no son válidas.',
  })
  @ApiUnauthorizedResponse({
    description: 'La cuenta con la que intenta iniciar no está activa.',
  })
  @RateLimit({
    keyPrefix: 'login',
    points: 5,
    duration: 60,
    errorMessage: 'Solo puede intentar 5 veces en 5 minutos máximo.',
  })
  async login(
    @Body() body: LoginDTO,
    @Request() req,
  ): Promise<LoginResponseDTO> {
    return this.authService.login(req.user);
  }

  /**
   * Esta ruta es llamada por el front para verificar la validéz del token
   * que se pretende usar al inicializar al usuario.
   *
   * Hay que considerar si se usa o no.
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('ping')
  @ApiOkResponse({
    description: 'El usuario tiene un jwt válido',
  })
  async ping(): Promise<PingResponseDTO> {
    return { result: 'OK' };
  }

  /**
   * Se debera hacer un post con el token de facebook a esta url
   *
   * esta a su vez, regresara el identity y el token local para el usuario.
   *
   * si la cuenta no existe la crea, la busca por facebook id. (facebookStrategy)
   *
   * @param user
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('facebook-token'))
  @Post('facebook/verify')
  verifyFacebook(@User() user: UserEntity): Promise<LoginResponseDTO> {
    return this.authService.login(user);
  }

  /**
   * Se debera hacer un post con el token de facebook a esta url
   *
   * esta a su vez, regresara el identity y el token local para el usuario.
   *
   * si la cuenta no existe la crea, la busca por facebook id. (facebookStrategy)
   *
   * @param user
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('google-verify-token'))
  @Post('google/verify')
  verifyGoogle(@User() user: UserEntity): Promise<LoginResponseDTO> {
    return this.authService.login(user);
  }
}
