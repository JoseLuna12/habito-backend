import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  UsePipes,
  Headers,
  HttpException,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/guards/Authentication.guard';
import { JaiValidationPipe } from 'src/pipes/validation.pipe';
import { createAuthTokenSchema } from './dto/auth-token.dto';
import { Response } from 'express';
import { AuthorizationTokenService } from './authorization-token.service';

@UseGuards(AuthenticationGuard)
@Controller('authorization-token')
export class AuthorizationTokenController {
  constructor(private authTokenService: AuthorizationTokenService) {}

  @Post('/generate')
  @UsePipes(new JaiValidationPipe(createAuthTokenSchema))
  async generateAuthorizationToken(
    @Body() body: { password: string },
    @Res() res: Response,
    @Headers('user-id') id: number,
  ) {
    const validationToken =
      await this.authTokenService.generateAuthorizationTokeForUser(
        id,
        body.password,
      );

    if (validationToken.error) {
      throw new HttpException(
        `${validationToken.error} ${validationToken.message}`,
        validationToken.status,
      );
    }

    res.status(validationToken.status).json(validationToken.data);
  }
}
