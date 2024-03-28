import { ExecutionContext, mixin } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const Auth0Guard = (isMaybe: boolean = false) => {
  class Auth0GuardMixin extends AuthGuard('jwt') {
    canActivate(ctx: ExecutionContext) {
      const req = ctx.switchToHttp().getRequest();
      const authHeader = req.headers?.authorization;
      if (!authHeader) return isMaybe;
      return super.canActivate(ctx);
    }
  }
  return mixin(Auth0GuardMixin);
};
