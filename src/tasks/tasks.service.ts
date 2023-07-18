import { HttpStatus, Injectable } from '@nestjs/common';
import { TaskDto } from './dto/task.dto';
import { DatabaseService } from 'src/database/database.service';
import * as q from 'faunadb';

@Injectable()
export class TasksService {
  constructor(private fauna: DatabaseService) {}

  getClient(token: string) {
    return this.fauna.getFaunaInstance(token);
  }

  async createNewTask(newTask: TaskDto, user: string) {
    const client = this.fauna.getFaunaInstance(user);
    try {
      const owner: any = await client.query(q.CurrentIdentity());
      const task = await client.query(
        q.Create(q.Collection('tasks'), {
          data: { ...newTask, owner: owner.ref },
        }),
      );
      return {
        task,
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      return {
        task: null,
        error: err.message,
        description: err.errors()[0].description,
        status: HttpStatus.FORBIDDEN,
      };
    }
  }
}
