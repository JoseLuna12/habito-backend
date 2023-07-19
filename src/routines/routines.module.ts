import { Module } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { DatabaseModule } from 'src/database/database.module';
import { RoutinesController } from './routines.controller';

@Module({
  imports: [DatabaseModule],
  providers: [RoutinesService],
  controllers: [RoutinesController],
})
export class RoutinesModule {}
