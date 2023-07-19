import { HttpStatus, Injectable } from '@nestjs/common';
import { TaskDto } from './dto/task.dto';
import { DatabaseService } from 'src/database/database.service';
import { Task } from '@prisma/client';

type TaskResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
  status: HttpStatus;
};

@Injectable()
export class TasksService {
  constructor(private database: DatabaseService) {}

  async updateTask(
    task: Partial<TaskDto> & { id: number },
    user: string,
  ): Promise<TaskResponse<Partial<TaskDto> & { id: number }>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { time, ...taskToUpdate } = task;
    try {
      const { id } = await this.database.updateTaskById(taskToUpdate, user);
      return {
        data: { ...task, id },
        status: HttpStatus.OK,
      };
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not update task',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async createNewTask(
    newTask: TaskDto,
    user: string,
  ): Promise<TaskResponse<Task>> {
    try {
      const task = await this.database.createTask({
        ...newTask,
        owner: { connect: { email: user } },
      });

      return {
        data: task,
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not create task',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async getTasksByDay(
    day: string,
    user: string,
  ): Promise<TaskResponse<Task[]>> {
    try {
      const tasks = await this.database.getTasksByDay(day, user);

      return {
        data: tasks,
        status: HttpStatus.FOUND,
      };
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not found tasks for user',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  async getTasksByUser(user: string): Promise<TaskResponse<Task[]>> {
    try {
      const tasks = await this.database.getTasksByUser(user);

      return {
        data: tasks,
        status: HttpStatus.FOUND,
      };
    } catch (err) {
      return {
        error: `${err.name}:`,
        message: 'Could not found tasks for user',
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }
}
