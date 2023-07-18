import {
  Body,
  Controller,
  HttpException,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { Response } from 'express';
import { JaiValidationPipe } from '../pipes/validation.pipe';
import { UserDto, createUserSchema, loginUserSchema } from './dto/user.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('/new')
  @UsePipes(new JaiValidationPipe(createUserSchema))
  async newUser(@Body() newUser: UserDto) {
    const user = await this.authService.createUser({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
    });
    return user;
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
        `${credentials.error}: ${credentials.description}`,
        credentials.status,
      );
    }
    res.status(credentials.status).json({ secret: credentials.secret });
  }
}
