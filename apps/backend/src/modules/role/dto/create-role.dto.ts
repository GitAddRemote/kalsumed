// apps/backend/src/modules/role/dto/create-role.dto.ts

import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateRoleDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[\w-]+$/, {
    message:
      'Role name may only contain letters, numbers, underscores, and hyphens.',
  })
  name!: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @MaxLength(100)
  description?: string;
}
