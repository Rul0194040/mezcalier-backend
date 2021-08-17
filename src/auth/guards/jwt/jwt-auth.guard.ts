import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/**
 * @ignore
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
