/**
 * Data Transfer Object for creating a new Role.
 *
 * @file apps/backend/src/modules/role/dto/create-role.dto.ts
 * @author Demian (GitAddRemote)
 * @copyright (c) 2025 Presstronic Studios LLC
 * @description DTO for validating and transferring data when creating a new role, supporting dynamic permissions.
 */

import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsBoolean,
} from 'class-validator';

/**
 * Trims a string value safely.
 * @param value The value to trim.
 * @returns The trimmed string or the original value.
 */
function safeTrim(value: unknown): unknown {
  if (typeof value === 'string') return value.trim();
  return value;
}

/**
 * DTO for creating a new role.
 */
export class CreateRoleDto {
  /**
   * The unique name of the role (kebab-case).
   */
  @Transform(({ value }) => safeTrim(value), { toClassOnly: true })
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'name must be kebab-case: lowercase letters, numbers, dashes',
  })
  readonly name!: string;

  /**
   * Optional description of the role.
   */
  @Transform(({ value }) => safeTrim(value), { toClassOnly: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly description?: string;

  /**
   * Whether the role is active.
   */
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  /**
   * List of permission names assigned to the role.
   */
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  readonly permissions?: string[];
}
