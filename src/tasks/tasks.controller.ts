import {
  Body,
  Controller,
  Headers,
  HttpException,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JaiValidationPipe } from 'src/pipes/validation.pipe';
import { TaskDto, createTaskSchema } from './dto/task.dto';
import { Response, Request } from 'express';

@Controller('tasks')
export class TasksController {
  constructor(private service: TasksService) {}

  @Post('/new')
  @UsePipes(new JaiValidationPipe(createTaskSchema))
  async newTask(
    @Headers() headers: Request,
    @Body() body: TaskDto,
    @Res() res: Response,
  ) {
    // const token = headers['authorization'] as string;

    // const task = await this.service.createNewTask(body, token);
    // if (task.error) {
    //   throw new HttpException(`${task.error} ${task.description}`, task.status);
    // }

    // res.status(task.status).send(task.task);
    res.send('ok');
  }
}
