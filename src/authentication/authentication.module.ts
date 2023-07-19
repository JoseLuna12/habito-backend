import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthenticationController } from './authentication.controller';
import { AuthorizationTokenModule } from 'src/authorization-token/authorization-token.module';

@Module({
  imports: [DatabaseModule, AuthorizationTokenModule],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
