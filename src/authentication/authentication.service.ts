import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { TokensService } from 'src/tokens/tokens.service';
import { AuthorizationTokenService } from 'src/authorization-token/authorization-token.service';

type AuthenticationResponse<T> = {
  data?: T;
  secret?: string;
  error?: string;
  message?: string;
  statusCode: HttpStatus;
};

@Injectable()
export class AuthenticationService {
  constructor(
    private database: DatabaseService,
    private tokenService: TokensService,
    private authorizationToken: AuthorizationTokenService,
  ) {}
  private static saltRounds = 10;

  async updateUser(
    user: Pick<UserDto, 'email' | 'name'> & {
      id: number;
      authorization: string;
    },
  ): Promise<AuthenticationResponse<{ id: number }>> {
    if (user.email && !user.authorization) {
      return {
        error: 'Can not update',
        message: 'not enough permission to perform update',
        statusCode: HttpStatus.FORBIDDEN,
      };
    }

    if (user.email && user.authorization) {
      const emailExists = await this.database.findUserByEmail(user.email);
      if (emailExists) {
        return {
          error: 'email already in use:',
          message: `email '${emailExists.email}' is already taken`,
          statusCode: HttpStatus.BAD_REQUEST,
        };
      }

      const permission = await this.authorizationToken.checkAuthorizationToken(
        user.id,
        user.authorization,
      );

      if (permission.error) {
        return {
          error: permission.error,
          message: permission.message,
          statusCode: permission.status,
        };
      }

      if (!permission.data.permissionGranted) {
        return {
          error: 'Can not update',
          message: 'not enough permission to perform update',
          statusCode: HttpStatus.FORBIDDEN,
        };
      }
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { authorization, ...userData } = user;

      const { id: updatedId } = await this.database.updateUser(userData);
      if (updatedId) {
        return {
          data: { id: updatedId },
          statusCode: HttpStatus.OK,
        };
      }
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not update user',
        statusCode: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async createUser(
    user: UserDto,
  ): Promise<AuthenticationResponse<Pick<User, 'id' | 'email' | 'name'>>> {
    try {
      const userExists = await this.database.getUserByEmail(user.email);

      if (userExists) {
        return {
          error: 'User already exists',
          message: 'Email already exits',
          statusCode: HttpStatus.BAD_REQUEST,
        };
      }

      const salt = await bcrypt.genSalt(AuthenticationService.saltRounds);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      const newUser = await this.database.createUser({
        ...user,
        password: hashedPassword,
      });

      const token = this.tokenService.generateToken(newUser);

      return {
        data: newUser,
        secret: token,
        statusCode: HttpStatus.CREATED,
      };
    } catch (err) {
      return {
        error: 'unknown',
        message: 'Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async comparePasswords(userPassword: string, dbPassword: string) {
    const matchedPassword = await bcrypt.compare(userPassword, dbPassword);
    return matchedPassword;
  }

  async loginUser(
    user: Pick<UserDto, 'email' | 'password'>,
  ): Promise<AuthenticationResponse<Omit<User, 'password'>>> {
    const userRef = await this.database.getUserByEmail(user.email);

    if (!userRef) {
      return {
        error: 'not found',
        message: 'email does not exists',
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    const { password, ...userReturned } = userRef;
    const matchPassword = await this.comparePasswords(user.password, password);

    if (!matchPassword) {
      return {
        error: 'Bad credentials',
        message: 'Email or password incorrect',
        statusCode: HttpStatus.FORBIDDEN,
      };
    }

    const token = this.tokenService.generateToken(userReturned);

    return {
      data: userReturned,
      secret: token,
      statusCode: HttpStatus.OK,
    };
  }
}
