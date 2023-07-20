import {
  Body,
  Controller,
  Headers,
  HttpException,
  Post,
  Put,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Response } from 'express';
import { JaiValidationPipe } from '../pipes/validation.pipe';
import {
  UserDto,
  createUserSchema,
  loginUserSchema,
  updateUserSchema,
} from './dto/user.dto';
import { AuthenticationGuard } from 'src/guards/Authentication.guard';
import { AuthorizationTokenGuard } from 'src/guards/Authorization-token.guard';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('/new')
  @UsePipes(new JaiValidationPipe(createUserSchema))
  async newUser(@Body() newUser: UserDto, @Res() res: Response) {
    const user = await this.authService.createUser({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
    });
    if (user.error) {
      throw new HttpException(`${user.error} ${user.message}`, user.status);
    }

    res.status(user.status).json(user.data);
  }

  @Put('/user')
  @UseGuards(AuthenticationGuard)
  @UseGuards(AuthorizationTokenGuard)
  @UsePipes(new JaiValidationPipe(updateUserSchema))
  async updateUser(
    @Body() updateUser: Pick<UserDto, 'name' | 'email'>,
    @Res() res: Response,
    @Headers('user-id') id: number,
    @Headers('authorize-changes-token') authorizationToken: string,
  ) {
    const user = await this.authService.updateUser({
      ...updateUser,
      id,
      authorization: authorizationToken,
    });
    if (user.error) {
      throw new HttpException(`${user.error} ${user.message}`, user.status);
    }

    res.status(user.status).json(user.data);
  }

  @Post('/login')
  @UsePipes(new JaiValidationPipe(loginUserSchema))
  async login(
    @Body() request: Pick<UserDto, 'email' | 'password'>,
    @Res() res: Response,
  ) {
    const credentials = await this.authService.loginUser({
      email: request.email,
      password: request.password,
    });

    if (credentials.error) {
      throw new HttpException(
        `${credentials.error}: ${credentials.message}`,
        credentials.status,
      );
    }
    res.status(credentials.status).json(credentials);
  }
}
