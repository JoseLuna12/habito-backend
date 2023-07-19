import * as Joi from 'joi';
import { TaskDto, createTaskSchema } from 'src/tasks/dto/task.dto';

export const createRoutineEschema = Joi.object({
  name: Joi.string().optional(),
  time: Joi.string()
    .regex(new RegExp(/^(\d{2}):(\d{2}):(\d{4})$/))
    .required(),
  tasks: Joi.array().items(createTaskSchema),
  isTemplate: Joi.bool().default(false).optional(),
}).options({ abortEarly: false });

export const updateRoutineEschema = Joi.object({
  name: Joi.string().optional(),
  isTemplate: Joi.bool().optional(),
  completed: Joi.bool().optional(),
}).options({ abortEarly: false });

export const createTemplateFromRoutineSchema = Joi.object({
  routineId: Joi.number().integer().options({ convert: false }).required(),
}).options({ abortEarly: false });

export const createRoutineFromTemplateSchema = Joi.object({
  templateId: Joi.number().integer().options({ convert: false }).required(),
  time: Joi.string()
    .regex(new RegExp(/^(\d{2}):(\d{2}):(\d{4})$/))
    .required(),
}).options({ abortEarly: false });

export interface RoutineDto {
  name: string;
  tasks: TaskDto[];
  completed: boolean;
  time: string;
  isTemplate: boolean;
}
