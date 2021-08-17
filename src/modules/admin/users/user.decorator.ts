import { createParamDecorator, ExecutionContext } from '@nestjs/common';
/**
 * El objetivo de este decorador es para obtener el usuario que se encuentra en el req
 * se usa a nivel controller.
 */
export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return !!req.user ? req.user : {};
});
