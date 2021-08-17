import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { HouseEntity } from '@mezcal/modules/house.entity';
/**
 * @ignore
 */
export class LoginIdentityDTO {
  @ApiProperty()
  @IsInt()
  id: number;

  uuid: string;

  @ApiProperty()
  @IsInt()
  sub: number;

  @IsString()
  email: string;

  @ApiProperty({ type: [String] })
  @IsString()
  rules: string[];

  profile: string;

  house: HouseEntity;

  firstName: string;
  lastName: string;
  picUrl: string;
  createdAt: Date;
  validEmail: boolean;
  isMain: boolean;
}
