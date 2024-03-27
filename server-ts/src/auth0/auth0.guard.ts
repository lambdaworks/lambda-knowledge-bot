import { CanActivate, ExecutionContext, mixin } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const Auth0Guard = (isMaybe?: boolean) => {
  class Auth0MaybeGuardMixin implements CanActivate {
    jwtService = new JwtService();
    canActivate(ctx: ExecutionContext) {
      const req = ctx.switchToHttp().getRequest();
      const authHeader = req.headers?.authorization;
      if (isMaybe && !authHeader) return true;
      if (!authHeader) return false;
      const { isValid, userId } = decodeJwt(authHeader, this.jwtService);
      req.userId = userId;
      return isValid;
    }
  }

  const guard = mixin(Auth0MaybeGuardMixin);
  return guard;
};

const decodeJwt = (
  authHeader: string,
  jwtService: JwtService,
): { userId?: string; isValid: boolean } => {
  const decoded = jwtService.decode(authHeader.substring(7));
  if (
    decoded.iss !== `https://${process.env.AUTH0_DOMAIN}/` ||
    !decoded.aud.includes(process.env.AUTH0_AUDIENCE)
  )
    return { isValid: false };
  // NOTE: Comment out when testing locally
  if (Date.now() >= decoded.exp * 1000) return { isValid: false };
  return { isValid: true, userId: decoded.sub };
};
