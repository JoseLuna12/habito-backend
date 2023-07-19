import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RoutineDto } from './dto/routine.dto';
import { Template, routine } from '@prisma/client';

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
      if (newRoutine) {
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

  async deleteRoutine(
    routineId: number,
    user: number,
  ): Promise<RoutineResponse<routine>> {
    try {
      const deletedRoutine = await this.database.deleteRoutine(routineId, user);
      if (deletedRoutine) {
        return {
          data: deletedRoutine,
          status: HttpStatus.OK,
        };
      }
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not delete routine',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async deleteTemplate(
    templateId: number,
    user: number,
  ): Promise<RoutineResponse<Template>> {
    try {
      const deletedTemplate = await this.database.deleteTemplate(
        templateId,
        user,
      );
      if (deletedTemplate) {
        return {
          data: deletedTemplate,
          status: HttpStatus.OK,
        };
      }
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not delete template',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async transformRoutineToTemplate(routineId: number, user: number) {
    try {
      const template = await this.database.createTemplateFromRoutine(
        routineId,
        user,
      );
      return {
        data: template,
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      return {
        error: 'Could not create routine from template:',
        message: `${err.message}`,
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async transformTemplateToRoutine(
    templateId: number,
    user: number,
    time: string,
  ) {
    try {
      const routine = await this.database.createRoutineFromTemplate(
        templateId,
        user,
        time,
      );
      return {
        data: routine,
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      return {
        error: 'Could not create template from routine:',
        message: `${err.message}`,
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
