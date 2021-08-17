import { HouseEntity } from '@mezcal/modules/house.entity';
import { UserEntity } from '@mezcal/modules/admin/users/model/user.entity';
/**
 * Despuesta de suscripcion
 */
export class SubscriptionOkDTO {
  /**
   * @ignore
   */
  house: HouseEntity;
  /**
   * @ignore
   */
  user: UserEntity;
}
