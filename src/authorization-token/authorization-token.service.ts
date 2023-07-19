import { HttpStatus, Injectable } from '@nestjs/common';
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
    const now = new Date();

    try {
      const databaseToken = await this.database.getAuthorizationToken(
        user,
        token,
      );

      if (databaseToken) {
        await this.database.invalidateAuthorizationToken(databaseToken.token);
        const isExpired = databaseToken.expire.getTime() - now.getTime() < 0;

        if (isExpired) {
          return {
            error: 'Permission not granted',
            message: 'Permission tonken is expired',
            status: HttpStatus.FORBIDDEN,
          };
        }

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
