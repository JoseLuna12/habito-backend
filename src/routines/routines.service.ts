import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RoutineDto } from './dto/routine.dto';

type RoutineResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
  status: HttpStatus;
};

type AddId<T> = T & { id: number };

@Injectable()
export class RoutinesService {
  constructor(private database: DatabaseService) {}

  async createNewRoutine(
    routine: RoutineDto,
    user: number,
  ): Promise<RoutineResponse<AddId<RoutineDto>>> {
    try {
      const newRoutine = await this.database.createRoutine(routine, user);
      if (newRoutine?.id) {
        return {
          data: newRoutine,
          status: HttpStatus.CREATED,
        };
      }
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not create routine',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async completeRoutine(
    routineId: number,
    user: number,
  ): Promise<RoutineResponse<AddId<Pick<RoutineDto, 'completed'>>>> {
    try {
      const routine = await this.database.updateRoutine(
        {
          completed: true,
          id: routineId,
        },
        user,
      );
      return {
        data: { id: routine.id, completed: routine.completed },
        status: HttpStatus.OK,
      };
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not complete routine',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
