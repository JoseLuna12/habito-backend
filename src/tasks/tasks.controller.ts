import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JaiValidationPipe } from 'src/pipes/validation.pipe';
import { TaskDto, createTaskSchema } from './dto/task.dto';
import { Response } from 'express';
import { AuthenticationGuard } from 'src/guards/Authentication.guard';
@Controller('tasks')
@UseGuards(AuthenticationGuard)
export class TasksController {
  constructor(private service: TasksService) {}

  @Post('/new')
  @UsePipes(new JaiValidationPipe(createTaskSchema))
  async newTask(
    @Headers('user-email') email: string,
    @Body() body: TaskDto,
    @Res() res: Response,
  ) {
    const task = await this.service.createNewTask(body, email);
    if (task.error) {
      throw new HttpException(`${task.error} ${task.message}`, task.status);
    }

    res.status(task.status).send(task.data);
  }

  @Get('/many/:taskday')
  async tasksByDay(
    @Headers('user-email') email: string,
    @Param('taskday') day: string,
    @Res() res: Response,
  ) {
    const tasks = await this.service.getTasksByDay(day, email);

    if (tasks.error) {
      throw new HttpException(`${tasks.error} ${tasks.message}`, tasks.status);
    }

    res.status(tasks.status).json(tasks.data);
  }

  @Get('/byuser')
  async tasksByUser(
    @Headers('user-email') email: string,
    @Res() res: Response,
  ) {
    const tasks = await this.service.getTasksByUser(email);

    if (tasks.error) {
      throw new HttpException(`${tasks.error} ${tasks.message}`, tasks.status);
    }

    res.status(tasks.status).json(tasks.data);
  }
}
