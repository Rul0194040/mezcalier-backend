/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { SetMetadata } from '@nestjs/common';
/**
 * @ignore
 */
export const Rules = (...rules: string[]) => SetMetadata('rules', rules);
