import { Global, Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
