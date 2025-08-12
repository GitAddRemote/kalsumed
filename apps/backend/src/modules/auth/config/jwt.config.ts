import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

type JwtConfigShape = {
  accessSecret: string;
  accessExpiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
};

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfigShape => ({
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '3600s',
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  }),
);

export const jwtConfigValidationSchema = Joi.object({
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('3600s'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
});

// Export type for use in other files if needed
export type JwtConfigType = JwtConfigShape;