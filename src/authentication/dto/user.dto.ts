import * as Joi from 'joi';

export const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
}).options({
  abortEarly: false,
});

export const createUserSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
}).options({
  abortEarly: false,
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).options({
  abortEarly: false,
});

export interface UserDto {
  name: string;
  email: string;
  password: string;
}
