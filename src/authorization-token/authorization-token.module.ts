import { Global, Module } from '@nestjs/common';
import { AuthorizationTokenService } from './authorization-token.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthorizationTokenController } from './authorization-token.controller';
@Global()
@Module({
  imports: [DatabaseModule],
  providers: [AuthorizationTokenService],
  exports: [AuthorizationTokenService],
  controllers: [AuthorizationTokenController],
})
export class AuthorizationTokenModule {}
