import { Injectable } from '@nestjs/common';
import { HousesService } from '@mezcal/modules/owner/houses/houses.service';
import { ProfilesService } from '@mezcal/modules/admin/profiles/profiles.service';
import { UsersService } from '@mezcal/modules/admin/users/users.service';
import { SubscriptionDTO } from '@mezcal/modules/browser/suscription/dto/suscription.dto';
import { SubscriptionOkDTO } from '@mezcal/modules/browser/suscription/dto/suscriptionOk.dto';
import { ProfileTypes } from '../../admin/profiles/model/profiles.enum';
/**
 * Service de suscripcion
 */
@Injectable()
export class SuscriptionService {
  /**
   * @ignore
   */
  constructor(
    private readonly profileService: ProfilesService,
    private readonly houseService: HousesService,
    private readonly userService: UsersService,
  ) {}
  /**
   * Metodo de suscripcion
   * @param {SubscriptionDTO} suscriptionData
   */
  async subscribe(
    suscriptionData: SubscriptionDTO,
  ): Promise<SubscriptionOkDTO> {
    //el usuario sera profile owner
    const userProfile = await this.profileService.getByName(ProfileTypes.OWNER);

    //crear la casa(estatus no autorizada)
    suscriptionData.house.active = false; //crear casa inactiva
    const createdHouse = await this.houseService.create(suscriptionData.house);
    suscriptionData.user.active = false; //y el usuario tambien
    const createdUser = await this.userService.create(
      suscriptionData.user,
      userProfile,
      createdHouse,
      true, //el primer usuario con el que se suscribe la casa debe ser main
    );

    //retornar el usuario
    return {
      user: createdUser,
      house: createdHouse,
    };
  }
}
