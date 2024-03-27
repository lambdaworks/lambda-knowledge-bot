import { ExecutionContext, mixin } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

export const Auth0Guard = (isMaybe: boolean = false) => {
  class Auth0GuardMixin extends AuthGuard('jwt') {
    jwtService = new JwtService();
    canActivate(ctx: ExecutionContext) {
      const req = ctx.switchToHttp().getRequest();
      const authHeader = req.headers?.authorization;
      if (!authHeader) return isMaybe;
      const userId = extractUserId(authHeader, this.jwtService);
      req.userId = userId;
      return super.canActivate(ctx);
    }
  }
  return mixin(Auth0GuardMixin);
};

const extractUserId = (authHeader: string, jwtService: JwtService): string => {
  const decoded = jwtService.decode(authHeader.substring(7));
  return decoded.sub;
};
