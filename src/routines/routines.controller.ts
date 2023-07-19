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
} from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { AuthenticationGuard } from 'src/guards/Authentication.guard';
import { JaiValidationPipe } from 'src/pipes/validation.pipe';
import {
  RoutineDto,
  createRoutineEschema,
  createRoutineFromTemplateSchema,
  createTemplateFromRoutineSchema,
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
