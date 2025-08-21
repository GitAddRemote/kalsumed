/**
 * @file AuthController
 * @summary Handles authentication endpoints (login, refresh, logout) and cookie management.
 * @description
 * - Validates credentials and issues tokens.
 * - Supports refresh via request body or HTTP-only cookie.
 * - Uses runtime-safe cookie extraction to avoid `any` and satisfy ESLint.
 * @module AuthController
 * @author Demian
 * @copyright
 *   (c) 2025 Presstronic Studios LLC. All rights reserved.
 */

import {
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
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService, AuthTokensDto } from './auth.service.js';

/**
 * Narrow a cookie value to a string, if present.
 * This treats incoming request data as unknown and narrows at the boundary,
 * keeping ESLint (`no-unsafe-assignment` / `no-unsafe-member-access`) happy.
 *
 * @param req - Express request
 * @param name - Cookie name to extract
 * @returns The cookie value if it is a string; otherwise undefined
 */
function getCookie(req: Request, name: string): string | undefined {
  // `req.cookies` may be missing or untyped depending on middleware order.
  const cookiesUnknown = (req as { cookies?: unknown }).cookies;
  if (!cookiesUnknown || typeof cookiesUnknown !== 'object') return undefined;

  const value = (cookiesUnknown as Record<string, unknown>)[name];
  return typeof value === 'string' ? value : undefined;
}

/**
 * DTO for the login request body.
 */
export class LoginDto {
  /** User email (must be a valid email). */
  @IsEmail()
  email!: string;

  /** User password (minimum 6 characters). */
  @IsString()
  @MinLength(6)
  password!: string;
}

/**
 * DTO for the refresh request body.
 * The token can also be supplied via the `refresh_token` cookie.
 */
export class RefreshDto {
  /** Optional refresh token; if omitted, the controller falls back to cookie. */
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

/**
 * Authentication controller.
 *
 * Routes:
 * - POST /auth/login    → Issues access/refresh tokens and sets cookies.
 * - POST /auth/refresh  → Exchanges refresh token for new tokens.
 * - POST /auth/logout   → Clears auth cookies and performs server-side logout.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * Authenticate a user with email/password and return tokens.
   * Also sets HTTP-only cookies for access and refresh tokens.
   *
   * @param dto - Login credentials
   * @param res - Express response (passthrough)
   * @returns Newly issued access/refresh tokens
   * @throws UnauthorizedException When credentials are invalid
   */
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
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.auth.login(user);
    this.setAuthCookies(res, tokens);
    return tokens;
  }

  /**
   * Refresh tokens using either the request body or the `refresh_token` cookie.
   * Returns new access/refresh tokens and updates cookies.
   *
   * @param dto - Refresh request; body token is optional
   * @param req - Express request (cookies are safely narrowed)
   * @param res - Express response (passthrough)
   * @returns Refreshed access/refresh tokens
   * @throws UnauthorizedException When no valid refresh token is provided
   */
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

  /**
   * Log the user out by clearing authentication cookies.
   * Also invokes server-side logout (e.g., token revocation/invalidation).
   *
   * @param res - Express response (passthrough)
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    this.clearAuthCookies(res);
    this.auth.logout();
  }

  /**
   * Set HTTP-only cookies for access and refresh tokens.
   * Access token: short-lived (15 minutes).
   * Refresh token: long-lived (30 days).
   *
   * @param res - Express response
   * @param tokens - Tokens to persist in cookies
   */
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

  /**
   * Clear authentication cookies.
   *
   * @param res - Express response
   */
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
