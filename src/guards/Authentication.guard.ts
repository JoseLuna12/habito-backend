import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { TokensService } from 'src/tokens/tokens.service';

type UserGuardToken = {
  data: {
    id: string;
    email: string;
  };
};

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private tokenService: TokensService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.get('authorization-token');

    if (!token) {
      return false;
    }

    const isValidToken = this.tokenService.validateToken(token);

    if (isValidToken) {
      const { data } = this.tokenService.decodeToken<UserGuardToken>(token);

      const { id, email } = data;
      if (!id || !email) {
        return false;
      }

      request.headers['user-email'] = email;
      request.headers['user-id'] = id;

      return true;
    }
    return false;
  }
}
