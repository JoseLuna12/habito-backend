import {
  Controller,
  Post,
  UseGuards,
  UsePipes,
  Headers,
  Body,
  Res,
  HttpException,
  Put,
  Delete,
} from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { AuthenticationGuard } from 'src/guards/Authentication.guard';
import { JaiValidationPipe } from 'src/pipes/validation.pipe';
import {
  RoutineDto,
  createRoutineEschema,
  createRoutineFromTemplateSchema,
  createTemplateFromRoutineSchema,
  deleteRoutineSchema,
  deleteTemplateSchema,
} from './dto/routine.dto';
import { Response } from 'express';

@Controller('routines')
@UseGuards(AuthenticationGuard)
export class RoutinesController {
  constructor(private service: RoutinesService) {}
  @Post()
  @UsePipes(new JaiValidationPipe(createRoutineEschema))
  async newRoutine(
    @Headers('user-id') id: number,
    @Body() body: RoutineDto,
    @Res() res: Response,
  ) {
    const newRoutine = await this.service.createNewRoutine(body, id);
    if (newRoutine.error) {
      throw new HttpException(
        `${newRoutine.error} ${newRoutine.message}`,
        newRoutine.status,
      );
    }
    res.status(newRoutine.status).json(newRoutine.data);
  }

  @Delete('routine')
  @UsePipes(new JaiValidationPipe(deleteRoutineSchema))
  async deleteRoutine(
    @Headers('user-id') userId: number,
    @Body() body: { routineId: number },
    @Res() res: Response,
  ) {
    const routine = await this.service.deleteRoutine(body.routineId, userId);
    if (routine.error) {
      throw new HttpException(
        `${routine.error} ${routine.message}`,
        routine.status,
      );
    }

    res.status(routine.status).json(routine.data);
  }

  @Delete('template')
  @UsePipes(new JaiValidationPipe(deleteTemplateSchema))
  async deleteTemplate(
    @Headers('user-id') userId: number,
    @Body() body: { templateId: number },
    @Res() res: Response,
  ) {
    const template = await this.service.deleteTemplate(body.templateId, userId);
    if (template.error) {
      throw new HttpException(
        `${template.error} ${template.message}`,
        template.status,
      );
    }

    res.status(template.status).json(template.data);
  }

  @Put()
  async completeRoutine(
    @Headers('user-id') userId: number,
    @Body() body: { id: number },
    @Res() res: Response,
  ) {
    const routineUpdated = await this.service.completeRoutine(body.id, userId);
    if (routineUpdated.error) {
      throw new HttpException(
        `${routineUpdated.error} ${routineUpdated.message}`,
        routineUpdated.status,
      );
    }

    res.status(routineUpdated.status).json(routineUpdated.data);
  }

  @Post('template')
  @UsePipes(new JaiValidationPipe(createTemplateFromRoutineSchema))
  async createTemplateFromRoutine(
    @Headers('user-id') userId: number,
    @Body() body: { routineId: number },
    @Res() res: Response,
  ) {
    const template = await this.service.transformRoutineToTemplate(
      body.routineId,
      userId,
    );
    if (template.error) {
      throw new HttpException(
        `${template.error} ${template.message}`,
        template.status,
      );
    }

    res.status(template.status).json(template.data);
  }

  @Post('fromtemplate')
  @UsePipes(new JaiValidationPipe(createRoutineFromTemplateSchema))
  async createRoutineFromTemplate(
    @Headers('user-id') userId: number,
    @Body() body: { templateId: number; time: string },
    @Res() res: Response,
  ) {
    const template = await this.service.transformTemplateToRoutine(
      body.templateId,
      userId,
      body.time,
    );
    if (template.error) {
      throw new HttpException(
        `${template.error} ${template.message}`,
        template.status,
      );
    }

    res.status(template.status).json(template.data);
  }
}
