import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty({ example: 'eyJhbGci…' })
  readonly accessToken!: string;

  @ApiProperty({ example: 'eyJhbGci…' })
  readonly refreshToken!: string;
}
