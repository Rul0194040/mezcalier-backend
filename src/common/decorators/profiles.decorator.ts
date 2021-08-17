/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { SetMetadata } from '@nestjs/common';
/**
 * @ignore
 */
export const Profiles = (...profiles: string[]) =>
  SetMetadata('profiles', profiles);
