import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from './authentication/authentication.module';
import { TasksModule } from './tasks/tasks.module';
import { PrismaModule } from './prisma/prisma.module';
import { TokensModule } from './tokens/tokens.module';
import { AuthorizationTokenModule } from './authorization-token/authorization-token.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule,
    TasksModule,
    PrismaModule,
    TokensModule,
    AuthorizationTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
