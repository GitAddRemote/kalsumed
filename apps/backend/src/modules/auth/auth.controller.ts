import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService, AuthTokensDto } from './auth.service';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class RefreshDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensDto> {
    if (!dto.email || !dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = await this.auth.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.auth.login(user);
    this.setAuthCookies(res, tokens);
    return tokens;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request & { cookies?: Record<string, unknown> },
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensDto> {
    const cookieToken =
      typeof req.cookies?.refresh_token === 'string'
        ? req.cookies.refresh_token
        : undefined;
    const token = dto.refreshToken ?? cookieToken;
    if (!token) throw new UnauthorizedException('Missing refresh token');
    const tokens = await this.auth.refresh(token);
    this.setAuthCookies(res, tokens);
    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    this.clearAuthCookies(res);
    this.auth.logout();
  }

  private setAuthCookies(res: Response, tokens: AuthTokensDto): void {
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response): void {
    const secure = process.env.NODE_ENV === 'production';
    res.cookie('access_token', '', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      expires: new Date(0),
    });
    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      expires: new Date(0),
    });
  }
}
