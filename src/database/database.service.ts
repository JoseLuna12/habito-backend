// 'use strict';
import { Injectable } from '@nestjs/common';
import { AuthorizationToken, Prisma, Task, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { nanoid } from 'nanoid';
import { RoutineDto } from 'src/routines/dto/routine.dto';
import { TaskDto } from 'src/tasks/dto/task.dto';

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
    return this.prisma.authorizationToken.findUnique({
      where: {
        token,
        AND: [
          {
            active: {
              equals: true,
            },
          },
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

  createRoutine(routine: RoutineDto, user: number) {
    const { tasks, time, ...routineData } = routine;
    const tasksToCreate = tasks.map((t) => {
      return {
        ...t,
        ownerId: user,
        time,
      };
    });
    return this.prisma.routine.create({
      data: {
        ...routineData,
        time,
        createdBy: {
          connect: {
            id: user,
          },
        },
        tasks: {
          createMany: {
            data: tasksToCreate,
          },
        },
      },
      include: {
        tasks: true,
      },
    });
  }

  updateRoutine(
    routine: Omit<Partial<RoutineDto>, 'tasks' | 'time'> & { id: number },
    user: number,
  ) {
    const { id, ...data } = routine;
    return this.prisma.routine.update({
      where: {
        id,
        ownerId: user,
      },
      data,
    });
  }

  createTemplateFromRoutine(routineId: number, user: number) {
    return this.prisma.$transaction(async (tx) => {
      try {
        const foundroutine = await tx.routine.findUnique({
          where: { id: routineId },
          include: { tasks: true },
        });

        if (!foundroutine) {
          throw new Error('Routine does not exists');
        }

        const { tasks, ...routine } = foundroutine;

        const tasksToCreate = tasks.map<TaskDto & { ownerId: number }>((t) => {
          return {
            name: t.name,
            time: nanoid(10),
            note: t.note,
            ownerId: user,
          };
        });

        const newRoutine: Pick<RoutineDto, 'name' | 'time'> = {
          name: routine.name || 'New routine',
          time: nanoid(10),
        };

        const template = await tx.template.create({
          data: {
            createdBy: {
              connect: {
                id: user,
              },
            },
            routine: {
              create: {
                ...newRoutine,
                isTemplate: true,
                completed: false,
                createdBy: {
                  connect: {
                    id: user,
                  },
                },
                tasks: {
                  createMany: {
                    data: tasksToCreate,
                  },
                },
              },
            },
          },
          include: {
            routine: {
              include: { tasks: true },
            },
          },
        });
        return template;
      } catch (err) {
        throw err;
      }
    });
  }

  createRoutineFromTemplate(templateId: number, user: number, forDate: string) {
    return this.prisma.$transaction(async (tx) => {
      const foundTemplate = await tx.template.findUnique({
        where: {
          id: templateId,
        },
        include: {
          routine: {
            include: {
              tasks: true,
            },
          },
        },
      });
      if (!foundTemplate) {
        throw new Error('Template does not exists');
      }

      const { routine: routineData } = foundTemplate;

      const oldRoutine = await tx.routine.findUnique({
        where: { time: forDate },
      });

      if (oldRoutine) {
        throw new Error('Already a routine on that day');
      }

      const { tasks, ...routine } = routineData;

      const newRoutine: Pick<RoutineDto, 'name' | 'time'> = {
        name: routine.name,
        time: forDate,
      };

      const newTasks = tasks.map<TaskDto & { ownerId: number }>((t) => {
        return {
          name: t.name,
          time: forDate,
          note: t.note,
          ownerId: user,
        };
      });

      const newRoutineCreated = await tx.routine.create({
        data: {
          ...newRoutine,
          createdBy: {
            connect: {
              id: user,
            },
          },
          tasks: {
            createMany: {
              data: newTasks,
            },
          },
        },
        include: {
          tasks: true,
        },
      });
      return newRoutineCreated;
    });
  }
}
