import { Controller, Post, Body } from '@nestjs/common';
import { SubscriptionDTO } from '@mezcal/modules/browser/suscription/dto/suscription.dto';
import { SubscriptionOkDTO } from '@mezcal/modules/browser/suscription/dto/suscriptionOk.dto';
import { SuscriptionService } from '@mezcal/modules/browser/suscription/suscription.service';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
import { createUserDTO } from '@mezcal/modules/admin/users/model/createUser.dto';
import { UsersService } from '@mezcal/modules/admin/users/users.service';
import { ProfilesService } from '@mezcal/modules/admin/profiles/profiles.service';
import { ProfileTypes } from '@mezcal/modules/admin/profiles/model/profiles.enum';
import { RateLimit } from 'nestjs-rate-limiter';
/**
 * Controller para suscripciones
 *
 * Acceso publico
 */
@Controller('browse')
export class SuscriptionController {
  constructor(
    private readonly suscriptionService: SuscriptionService,
    private readonly userService: UsersService,
    private readonly profileService: ProfilesService,
  ) {}

  /**
   * Metodo de suscripcion publica para casas mezcaleras
   * @param {SubscriptionDTO} suscriptionData
   */
  @Post('suscription/house')
  @RateLimit({
    keyPrefix: 'suscribe-house',
    points: 1,
    duration: 300,
    errorMessage: 'Solo puede intentar 1 vez en 5 minutos máximo.',
  })
  subscribeHouse(
    @Body() suscriptionData: SubscriptionDTO,
  ): Promise<SubscriptionOkDTO> {
    return this.suscriptionService.subscribe(suscriptionData);
  }

  /**
   * Metodo de suscripcion publica para usuarios
   * @param {createUserDTO} userData
   */
  @Post('suscription/user')
  @RateLimit({
    keyPrefix: 'suscribe-user',
    points: 1,
    duration: 300,
    errorMessage: 'Solo puede intentar 1 vez en 5 minutos máximo.',
  })
  async subscribeUser(@Body() userData: createUserDTO): Promise<UserEntity> {
    //desde este punto solo se crean usuarios publicos.
    const userProfile = await this.profileService.getByName(
      ProfileTypes.PUBLIC,
    );
    return this.userService.create(userData, userProfile);
  }
}
