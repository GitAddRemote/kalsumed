mport { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
// (Optional) Uncomment if using Swagger decorators
// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

function safeTrim(value: unknown): unknown {
  if (typeof value === 'string') {
    const t = value.trim();
    return t;
  }
  return value;
}

export class CreateRoleDto {
  // @ApiProperty({ example: 'admin', description: 'Unique role name (kebab-case lowercase)' })
  @Transform(({ value }) => safeTrim(value), { toClassOnly: true })
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'name must be kebab-case: lowercase letters, numbers, dashes',
  })
  readonly name!: string;

  // @ApiPropertyOptional({ example: 'Administrative access', description: 'Optional description' })
  @Transform(({ value }) => safeTrim(value), { toClassOnly: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  readonly description?: string;
}
