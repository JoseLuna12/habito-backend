import { Injectable } from '@nestjs/common';
import { AuthorizationToken, Prisma, Task, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from 'nanoid';

@Injectable()
export class DatabaseService {
  constructor(private prisma: PrismaService) {}

  generateAuthorizationToken(userId: number): Promise<AuthorizationToken> {
    const time = new Date();
    time.setHours(time.getHours() + 1);

    const token = nanoid(30);

    return this.prisma.authorizationToken.create({
      data: {
        token,
        expire: time,
        userId,
      },
    });
  }

  getAuthorizationToken(userId: number, token: string) {
    const now = new Date();
    return this.prisma.authorizationToken.findUnique({
      where: {
        token,
        AND: [
          {
            active: {
              equals: true,
            },
          },
          // {
          //   expire: {
          //     lt: now,
          //   },
          // },
          {
            used: {
              equals: false,
            },
          },
        ],
        userId,
      },
    });
  }

  invalidateAuthorizationToken(token: string) {
    return this.prisma.authorizationToken.update({
      where: {
        token,
      },
      data: {
        active: false,
        used: true,
      },
    });
  }

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

  getUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
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

  updateUser(
    user: Partial<Pick<User, 'name' | 'email'>> & { id: number },
  ): Promise<{ id: number }> {
    const { id, ...userData } = user;
    return this.prisma.user.update({
      where: {
        id,
      },
      data: userData,
      select: {
        id: true,
      },
    });
  }

  updateTaskById(
    task: Partial<Pick<Task, 'name' | 'note'>> & { id: number },
    user: string,
  ): Promise<{ id: number }> {
    if (!task.name && !task.note) {
      return Promise.resolve({ id: task.id });
    }
    return this.prisma.task.update({
      where: {
        id: task.id,
        owner: {
          email: user,
        },
      },
      data: {
        name: task.name,
        note: task.note,
      },
      select: {
        id: true,
      },
    });
  }
}
