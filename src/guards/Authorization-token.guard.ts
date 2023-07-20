import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthorizationTokenService } from 'src/authorization-token/authorization-token.service';

@Injectable()
export class AuthorizationTokenGuard implements CanActivate {
  constructor(protected readonly authorization: AuthorizationTokenService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.get('authorize-changes-token');
    if (!token) {
      return false;
    }

    return this.authorization
      .validateTokenNonDestructiveGuard(token)
      .then((result) => {
        return result;
      });
  }
}
