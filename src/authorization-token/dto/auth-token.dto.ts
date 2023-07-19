import { User } from '@prisma/client';
import * as Joi from 'joi';

export const createAuthTokenSchema = Joi.object({
  password: Joi.string().required(),
}).options({
  abortEarly: false,
});

export interface TokenDto {
  token: string;
  generatedBy: User;
  userId: number;
  active: boolean;
  expire: Date;
}
