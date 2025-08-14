import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { PERMISSION_NAMES } from '../../permission/entities/permission.entity';

function safeTrim(value: unknown): unknown {
  if (typeof value === 'string') return value.trim();
  return value;
}

export class CreateRoleDto {
  @Transform(({ value }) => safeTrim(value), { toClassOnly: true })
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'name must be kebab-case: lowercase letters, numbers, dashes',
  })
  readonly name!: string;

  @Transform(({ value }) => safeTrim(value), { toClassOnly: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly description?: string;

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(PERMISSION_NAMES, {
    each: true,
    message: `each permission must be one of: ${PERMISSION_NAMES.join(', ')}`,
  })
  readonly permissions?: string[];
}
