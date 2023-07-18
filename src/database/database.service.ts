import { Injectable } from '@nestjs/common';
import { Prisma, Task, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class DatabaseService {
  constructor(private prisma: PrismaService) {}

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  createTask(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  getTasksByDay(day: string, user: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        owner: {
          email: user,
        },
        time: day,
      },
    });
  }

  getTasksByUser(user: string, take = 100, skip = 0): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        owner: {
          email: user,
        },
      },
      orderBy: {
        createdAt: Prisma.SortOrder.desc,
      },
      take,
      skip,
    });
  }
}
