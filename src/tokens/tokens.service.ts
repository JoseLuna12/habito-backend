import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

type TokenError = {
  error: string;
  message: string;
};

@Injectable()
export class TokensService {
  constructor(private config: ConfigService) {}
  generateToken<T>(data: T): string {
    const secret = this.config.get<string>('JWT_SECRET');
    const newJwt = jwt.sign({ data }, secret);
    return newJwt;
  }

  validateToken(token: string): boolean {
    const secret = this.config.get<string>('JWT_SECRET');
    try {
      jwt.verify(token, secret);
      return true;
    } catch (err) {
      return false;
    }
  }

  validateAndDecode<D>(token: string): D | TokenError {
    const secret = this.config.get<string>('JWT_SECRET');
    try {
      return jwt.verify(token, secret) as D;
    } catch (err) {
      return {
        error: err.name,
        message: err.message,
      };
    }
  }

  decodeToken<D>(token: string): D {
    return jwt.decode(token) as D;
  }
}
