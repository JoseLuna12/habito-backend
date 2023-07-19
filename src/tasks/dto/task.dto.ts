import * as Joi from 'joi';

export const createTaskSchema = Joi.object({
  name: Joi.string().required(),
  time: Joi.string()
    .regex(new RegExp(/^(\d{2}):(\d{2}):(\d{4})$/))
    .optional(),
  note: Joi.string().optional(),
}).options({ abortEarly: false });

export const updateTaskSchema = Joi.object({
  id: Joi.number().integer().options({ convert: false }).required(),
  name: Joi.string().optional(),
  note: Joi.string().optional(),
}).options({ abortEarly: false });

export const deleteTaskSchema = Joi.object({
  taskId: Joi.number().integer().options({ convert: false }).required(),
}).options({ abortEarly: false });

export interface TaskDto {
  name: string;
  time: string;
  note?: string;
}
