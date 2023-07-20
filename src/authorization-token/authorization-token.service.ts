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

  async validateTokenNonDestructiveGuard(token: string) {
    const authToken = await this.database.getAuthorizationTokenOnlyById(token);
    if (!authToken) {
      return false;
    }

    if (this.isTokenExpired(authToken.expire)) {
      return false;
    }

    return authToken.active;
  }

  isTokenExpired(tokenExpTime: Date): boolean {
    const now = new Date();
    return tokenExpTime.getTime() - now.getTime() < 0;
  }
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
          message: 'Password does not match',
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
      const databaseToken = await this.database.getAuthorizationToken(
        user,
        token,
      );

      if (!databaseToken) {
        return {
          error: 'Permission not granted',
          message: 'Permission tonken was invalid',
          status: HttpStatus.FORBIDDEN,
        };
      }

      await this.database.invalidateAuthorizationToken(databaseToken.token);
      const isExpired = this.isTokenExpired(databaseToken.expire);

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
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not get auth token',
        status: HttpStatus.FORBIDDEN,
      };
    }
  }
}
