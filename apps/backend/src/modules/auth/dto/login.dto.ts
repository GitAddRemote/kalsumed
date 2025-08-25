import {
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsString,
  MinLength,
} from 'class-validator';

@ValidatorConstraint({ name: 'IdentifierIsEmailOrUsername', async: false })
class IdentifierIsEmailOrUsername implements ValidatorConstraintInterface {
  private static readonly EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly USERNAME = /^[A-Za-z0-9._-]{4,30}$/; // 30 matches DB column

  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const s = value.trim();
    return IdentifierIsEmailOrUsername.EMAIL.test(s) || IdentifierIsEmailOrUsername.USERNAME.test(s);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'identifier must be a valid email or a username (4–30 chars, letters/numbers . _ -).';
  }
}

export class LoginDto {
  @IsString()
  @Validate(IdentifierIsEmailOrUsername)
  identifier!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
