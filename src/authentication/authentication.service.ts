import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { TokensService } from 'src/tokens/tokens.service';

type AuthenticationResponse<T> = {
  data?: T;
  secret?: string;
  error?: string;
  description?: string;
  status: HttpStatus;
};

@Injectable()
export class AuthenticationService {
  constructor(
    private database: DatabaseService,
    private tokenService: TokensService,
  ) {}
  private static saltRounds = 10;

  async createUser(user: UserDto): Promise<AuthenticationResponse<User>> {
    try {
      const userExists = await this.database.getUserByEmail(user.email);

      if (userExists) {
        return {
          error: 'User already exists',
          description: 'Email already exits',
          status: HttpStatus.BAD_REQUEST,
        };
      }

      const salt = await bcrypt.genSalt(AuthenticationService.saltRounds);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      const newUser = await this.database.createUser({
        ...user,
        password: hashedPassword,
      });

      return {
        data: newUser,
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      return {
        error: 'unknown',
        description: 'Error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async loginUser(
    user: Pick<UserDto, 'email' | 'password'>,
  ): Promise<AuthenticationResponse<Omit<User, 'password'>>> {
    const userRef = await this.database.getUserByEmail(user.email);

    if (!userRef) {
      return {
        error: 'not found',
        description: 'email does not exists',
        status: HttpStatus.NOT_FOUND,
      };
    }

    const { password, ...userReturned } = userRef;
    const matchPassword = await bcrypt.compare(user.password, password);

    if (!matchPassword) {
      return {
        error: 'Bad credentials',
        description: 'Email or password incorrect',
        status: HttpStatus.FORBIDDEN,
      };
    }

    const token = this.tokenService.generateToken(userReturned);

    return {
      data: userReturned,
      secret: token,
      status: HttpStatus.OK,
    };
  }
}
