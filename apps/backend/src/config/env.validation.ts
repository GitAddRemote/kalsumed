/**
 * @file Environment validation schema (Joi) for the application.
 * @summary Centralized schema used by ConfigModule to validate required env vars.
 * @author Presstronic Studios
 */

import Joi from 'joi';

/**
 * Base schema for core application configuration.
 * Module-specific schemas (e.g., JWT/seeding) are composed in AppModule via .concat(...).
 */
export const baseEnvValidationSchema = Joi.object({
  // Database (consumed by the app; compose maps to POSTGRES_* for the container)
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().required(),

  // Optional MQ (enabled when present)
  RABBITMQ_USER: Joi.string().optional(),
  RABBITMQ_PASSWORD: Joi.string().optional(),

  // Auth/crypto
  JWT_ACCESS_SECRET: Joi.string().required(),
  SESSION_SECRET: Joi.string().min(32).required(),

  // URLs (if your code reads them directly; kept required as in your current config)
  REDIS_URL: Joi.string().uri().required(),

  // Runtime
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
});
