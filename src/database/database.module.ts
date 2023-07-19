import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigModule } from '@nestjs/config';
// import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  imports: [ConfigModule, PrismaModule, TokensModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
