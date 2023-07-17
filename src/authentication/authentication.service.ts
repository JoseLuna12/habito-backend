import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as q from 'faunadb';
import { UserDto } from './dto/user.dto';

@Injectable()
export class AuthenticationService {
  constructor(private fauna: DatabaseService) {}

  private client = this.fauna.getFaunaInstance();

  createUser(user: UserDto) {
    return this.client.query(
      q.Create(q.Collection('users'), {
        credentials: { password: user.password },
        data: { email: user.email, name: user.name },
      }),
    );
  }

  async getUserByEmail(email: string) {
    const { data }: any = await this.fauna.callIndex(
      'get_users_by_email',
      email,
    );

    return data[0];
  }

  async loginUser(user: Pick<UserDto, 'email' | 'password'>) {
    const userRef = await this.getUserByEmail(user.email);

    if (userRef) {
      try {
        const { secret }: any = await this.client.query(
          q.Login(userRef, { password: user.password }),
        );
        return { secret, error: '', description: '', status: HttpStatus.OK };
      } catch (err) {
        return {
          secret: '',
          error: err.message,
          description: err.errors()[0].description,
          status: HttpStatus.FORBIDDEN,
        };
      }
    }

    return {
      secret: '',
      error: 'not found',
      description: 'email does not exists',
      status: HttpStatus.NOT_FOUND,
    };
  }

  deleteUser(ref: string) {
    return this.client.query(q.Delete(ref));
  }
}
