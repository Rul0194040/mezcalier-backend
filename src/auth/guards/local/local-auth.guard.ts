import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/**
 * @ignore
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
