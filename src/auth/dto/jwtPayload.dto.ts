import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsBoolean } from 'class-validator';
import { HouseEntity } from '@mezcal/modules/house.entity';
/**
 * @ignore
 */
export class JWTPayLoadDTO {
  @ApiProperty()
  @IsString()
  email: string;
  @ApiProperty()
  @IsUUID()
  uuid: string;
  @ApiProperty()
  @IsNumber()
  sub: number;
  @ApiProperty()
  @IsNumber()
  id: number;
  @ApiProperty()
  rules: string[];
  @ApiProperty()
  profile: string;
  @ApiProperty()
  house: HouseEntity;
  @ApiProperty()
  @IsBoolean()
  isMain: boolean;
}
