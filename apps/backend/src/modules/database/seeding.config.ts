import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export type SeedingMode = 'auto' | 'off' | 'force';

export default registerAs('seeding', () => ({
  /**
   * Seeding behavior:
   *  - auto  => run in dev, skip in prod (your DatabaseModule.register() enforces this)
   *  - off   => never seed
   *  - force => always seed (even in prod)
   */
  mode: (process.env.SEEDING_MODE as SeedingMode) ?? 'auto',

  /**
   * Optional admin bootstrap password used by the seeder.
   * In production, your seeder will require this to be set explicitly.
   */
  adminDefaultPassword: process.env.ADMIN_DEFAULT_PASSWORD ?? undefined,

  /**
   * Bcrypt cost factor for hashing the default admin password.
   */
  adminPasswordSaltRounds: Number(process.env.ADMIN_PASSWORD_SALT_ROUNDS ?? 10),
}));

/**
 * Validation schema for all seeding-related environment variables.
 * Add this to your ConfigModule validation.
 */
export const seedingConfigSchema = Joi.object({
  SEEDING_MODE: Joi.string().valid('auto', 'off', 'force').default('auto'),
  ADMIN_DEFAULT_PASSWORD: Joi.string().optional(), // required in prod by seeder logic if seeding runs
  ADMIN_PASSWORD_SALT_ROUNDS: Joi.number().integer().min(4).max(15).default(10),
});
