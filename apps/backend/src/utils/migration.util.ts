/**
 * @file apps/backend/src/utils/migration.util.ts
 * @summary Safe utilities for migrations & seeding with strict error handling.
 * @module Utils/MigrationUtil
 * @description
 *  - `runMigrations()` works with 0 args (auto-resolves ../data-source),
 *    a Nest application context, or a TypeORM DataSource.
 *  - Uniform logging wrappers and safe error extractors.
 *  - ESLint-friendly: no `any`, no unsafe member access, no unnecessary assertions.
 *    Ensures promise rejections are always `Error` instances.
 * @author
 *  Demian (GitAddRemote)
 * @copyright
 *  (c) 2025 Presstronic Studios LLC
 */

import type { INestApplicationContext } from '@nestjs/common';
import { DataSource } from 'typeorm';

type LoggerLike = Pick<Console, 'log' | 'error' | 'time' | 'timeEnd'>;

/** Narrow type for generic non-null objects. */
type UnknownRecord = Record<string, unknown>;

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null;
}

/** Type guard for a Nest application context (has a callable `get`). */
function isNestAppContext(v: unknown): v is INestApplicationContext {
  return isRecord(v) && typeof v['get'] === 'function';
}

/**
 * Get a human-friendly error message from an unknown error value.
 * Never throws; always returns a string.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (isRecord(err) && typeof err.message === 'string') return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * Get an error stack string from an unknown error value, if present.
 */
export function getErrorStack(err: unknown): string | undefined {
  if (err instanceof Error && typeof err.stack === 'string') return err.stack;
  if (isRecord(err) && typeof err.stack === 'string') return err.stack;
  return undefined;
}

/**
 * Run an async step (e.g., a migration or seeder phase) with uniform logging.
 * Times the step and logs success/failure. Rethrows the original error.
 */
export async function withMigrationLog<T>(
  label: string,
  task: () => Promise<T>,
  logger: LoggerLike = console,
): Promise<T> {
  logger.time?.(label);
  logger.log(`[START] ${label}`);
  try {
    const result = await task();
    logger.timeEnd?.(label);
    logger.log(`[OK]    ${label}`);
    return result;
  } catch (err: unknown) {
    const message = getErrorMessage(err);
    const stack = getErrorStack(err);
    logger.timeEnd?.(label);
    logger.error(`[FAIL] ${label}: ${message}`);
    if (stack) logger.error(stack);
    // Always rethrow an Error instance to satisfy prefer-promise-reject-errors.
    throw (err instanceof Error ? err : new Error(message));
  }
}

/**
 * Wrap a synchronous step in a promise and delegate to `withMigrationLog`.
 * Ensures rejections are always `Error` instances (satisfies prefer-promise-reject-errors).
 */
export function withMigrationLogSync<T>(
  label: string,
  task: () => T,
  logger: LoggerLike = console,
): Promise<T> {
  return withMigrationLog(
    label,
    () =>
      new Promise<T>((resolve, reject) => {
        try {
          const value = task();
          resolve(value);
        } catch (e: unknown) {
          reject(e instanceof Error ? e : new Error(getErrorMessage(e)));
        }
      }),
    logger,
  );
}

/** Pick a DataSource export from the ../data-source module safely (no casts). */
function pickDataSource(mod: unknown): DataSource {
  if (!isRecord(mod)) {
    throw new Error('Invalid data-source module export.');
  }
  for (const key of Object.keys(mod)) {
    const candidate = mod[key];
    if (candidate instanceof DataSource) return candidate;
  }
  throw new Error('No DataSource instance exported by ../data-source.');
}

/**
 * Run TypeORM migrations and log the result.
 * Accepts 0 args (auto-import ../data-source), a Nest app context, or a DataSource.
 */
export async function runMigrations(
  appOrDs?: INestApplicationContext | DataSource,
  logger: LoggerLike = console,
): Promise<void> {
  let ds: DataSource;

  if (appOrDs instanceof DataSource) {
    ds = appOrDs;
  } else if (isNestAppContext(appOrDs)) {
    ds = appOrDs.get(DataSource);
  } else {
    // Zero-arg mode: dynamically import ../data-source and pick the DataSource export.
    const mod: unknown = await import('../data-source.js');
    ds = pickDataSource(mod);
  }

  await withMigrationLog('typeorm:migrations', async () => {
    const results = await ds.runMigrations();
    const ran =
      Array.isArray(results) && results.length > 0
        ? results.map((r) => r.name).join(', ')
        : '(none)';
    logger.log(`[MIGRATIONS] Applied: ${ran}`);
  }, logger);
}
