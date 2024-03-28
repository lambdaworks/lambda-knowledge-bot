import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: UserInRequest;
}
interface UserInRequest {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  scope: string;
  azp: string;
}
