import { HouseDTO } from '@mezcal/modules/browser/houses/dtos/house.dto';
import { createUserDTO } from '@mezcal/modules/admin/users/model/createUser.dto';
/**
 * Compuesto para la suscripcion, debe incluir un user y una casa
 */
export class SubscriptionDTO {
  /**
   * @ignore
   */
  house: HouseDTO;
  /**
   * @ignore
   */
  user: createUserDTO;
}
