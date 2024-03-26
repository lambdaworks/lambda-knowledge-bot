import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class Auth0Guard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const authHeader = req.headers?.authorization;
    if (!authHeader) return false;
    const { isValid, userId } = decodeJwt(authHeader);
    req.userId = userId;
    return isValid;
  }
}

@Injectable()
export class Auth0MaybeGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const authHeader = req.headers?.authorization;
    if (!authHeader) return true;
    const { isValid, userId } = decodeJwt(authHeader);
    req.userId = userId;
    return isValid;
  }
}

const decodeJwt = (
  authHeader: string,
): { userId?: string; isValid: boolean } => {
  const decoded = jwtDecode(authHeader);
  if (
    decoded.iss !== `https://${process.env.AUTH0_DOMAIN}/` ||
    !decoded.aud.includes(process.env.AUTH0_AUDIENCE)
  )
    return { isValid: false };
  // NOTE: Comment out when testing locally
  if (Date.now() >= decoded.exp * 1000) return { isValid: false };
  return { isValid: true, userId: decoded.sub };
};
