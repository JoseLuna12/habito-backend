import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt';

type AuthTokenResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
  status: HttpStatus;
};

@Injectable()
export class AuthorizationTokenService {
  constructor(private database: DatabaseService) {}

  async generateAuthorizationTokeForUser(
    user: number,
    password: string,
  ): Promise<AuthTokenResponse<{ token: string }>> {
    try {
      const { password: passwordDb } = await this.database.getUserById(user);
      const matchedPasswords = await bcrypt.compare(password, passwordDb);

      if (!matchedPasswords) {
        return {
          error: 'Incorrect credentials',
          message: 'Password does not exists',
          status: HttpStatus.FORBIDDEN,
        };
      }

      const { token } = await this.database.generateAuthorizationToken(user);
      return {
        data: { token },
        status: HttpStatus.OK,
      };
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not create auth token',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async checkAuthorizationToken(
    user: number,
    token: string,
  ): Promise<AuthTokenResponse<{ permissionGranted: boolean }>> {
    try {
      const t = await this.database.getAuthorizationToken(user, token);
      console.log({ t });
      if (t) {
        await this.database.invalidateAuthorizationToken(t.token);
        return {
          data: { permissionGranted: true },
          status: HttpStatus.ACCEPTED,
        };
      } else {
        return {
          error: 'Permission not granted',
          message: 'Permission tonken was invalid',
          status: HttpStatus.FORBIDDEN,
        };
      }
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not create auth token',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
