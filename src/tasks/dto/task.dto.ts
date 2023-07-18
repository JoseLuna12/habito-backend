import * as Joi from 'joi';

export const createTaskSchema = Joi.object({
  name: Joi.string().required(),
  time: Joi.string()
    .regex(new RegExp(/^(\d{2}):(\d{2}):(\d{4})$/))
    .optional(),
  note: Joi.string().optional(),
}).options({ abortEarly: false });

export interface TaskDto {
  name: string;
  time: string;
  note: string;
}
