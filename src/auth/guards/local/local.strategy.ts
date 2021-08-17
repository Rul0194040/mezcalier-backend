import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@mezcal/auth/auth.service';
/**
 * Aqí se valida el usuario por medio del service
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * @ignore
   */
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }
  /**
   * Login del usuario
   * @param email
   * @param password
   */
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new HttpException(
        'Sus credenciales no son válidas',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
