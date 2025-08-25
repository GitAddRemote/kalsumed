/**
 * @file AuthController
 * @summary Handles authentication endpoints (login, refresh, logout) and cookie management.
 * @description
 * - Validates credentials (email OR username) and issues tokens.
 * - Supports refresh via request body or HTTP-only cookie.
 * - Uses safe runtime narrowing for cookies; no `any`, no unsafe member access.
 * @module AuthController
 * @author Demian
 * @copyright
 *   (c) 2025 Presstronic Studios LLC. All rights reserved.
 */

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDto, RefreshDto } from './dto/index.js';
import { AuthService, AuthTokensDto } from './auth.service.js';
import type { User } from '../user/entities/user.entity.js';

/** Type guard: is Record<string, string>? */
function isStringRecord(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  for (const v of Object.values(value as Record<string, unknown>)) {
    if (typeof v !== 'string') return false;
  }
  return true;
}

/** Type guard: does obj have a 'cookies' field (unknown-typed)? */
function hasCookieJar(obj: unknown): obj is { cookies: unknown } {
  return typeof obj === 'object' && obj !== null && 'cookies' in (obj as Record<string, unknown>);
}

/** Safely get a cookie value as string (or undefined). */
function getCookie(req: Request, name: string): string | undefined {
  if (!hasCookieJar(req)) return undefined;
  const jarUnknown: unknown = req.cookies;
  if (!isStringRecord(jarUnknown)) return undefined;
  return jarUnknown[name];
}

/** Minimal user-shape guard so we never pass unknown to the service */
function isUser(u: unknown): u is User {
  return typeof u === 'object' && u !== null;
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
    const identifier = dto.identifier?.trim();
    if (!identifier) {
      throw new BadRequestException('Provide either email or username.');
    }

    const candidate = await this.auth.validateUser(identifier, dto.password);
    if (!isUser(candidate)) {
      // covers null or unexpected shapes
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.auth.login(candidate);
    this.setAuthCookies(res, tokens);
    return tokens;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokensDto> {
    const cookieToken = getCookie(req, 'refresh_token');
    const token = dto.refreshToken ?? cookieToken;

    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

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
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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
