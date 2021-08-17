import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { LoginIdentityDTO } from '@mezcal/auth/dto/loginIdentity.dto';
/**
 * @ignore
 */
export class LoginResponseDTO {
  @ApiProperty({
    description:
      'Token JWT generado, contiene la identidad del user y sus rules.',
  })
  @IsString()
  access_token: string;

  @ApiProperty({
    description:
      'Identidad del user y sus rules para ser procesadas y utilizadas por el front.',
  })
  identity: LoginIdentityDTO;
}
