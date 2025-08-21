/**
 * @file apps/backend/src/modules/auth/token/token.controller.ts
 * @summary Token endpoints for login, refresh, and logout with strict typing.
 * @module Auth/Tokens/TokenController
 * @description
 *   - `POST /auth/login`: verifies credentials and returns access/refresh tokens
 *   - `POST /auth/refresh`: exchanges a valid refresh token for new tokens
 *   - `POST /auth/logout`: revokes the current refresh token
 * @author
 *   Demian (GitAddRemote)
 * @copyright
 *   (c) 2025 Presstronic Studios LLC
 */

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { TokenService } from './token.service.js';
import { AuthService } from '../auth.service.js';
import { LoginDto } from '../dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { TokensDto } from './dto/token.dto.js';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

/**
 * Authenticated request shape injected by JWT guards.
 */
interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
  };
}

/**
 * JWT payload used by token generation helpers.
 */
interface JwtPayload {
  sub: string;
  username?: string;
}

@ApiTags('auth')
@Controller('auth')
export class TokenController {
  /**
   * @class TokenController
   * @classdesc Exposes login, refresh, and logout endpoints. Uses TokenService for
   * token creation/validation and AuthService for user credential verification.
   */
  constructor(
    private readonly tokenService: TokenService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Log in with username/password and receive access & refresh tokens.
   * @route POST /auth/login
   */
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in and receive access & refresh tokens' })
  @ApiResponse({ status: 200, type: TokensDto })
  async login(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: LoginDto,
  ): Promise<TokensDto> {
    const user = await this.validateUser(dto.username, dto.password);
    const payload: JwtPayload = { sub: user.id, username: user.username };

    return {
      accessToken: this.tokenService.generateAccessToken(payload),
      refreshToken: this.tokenService.generateRefreshToken(payload),
    };
  }

  /**
   * Exchange a valid refresh token for new tokens.
   * NOTE: Not marked `async` because there is nothing to await.
   * @route POST /auth/refresh
   */
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange a valid refresh token for new tokens' })
  @ApiResponse({ status: 200, type: TokensDto })
  refresh(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: RefreshTokenDto,
    @Req() req: AuthenticatedRequest,
  ): TokensDto {
    const userId = req.user.userId;

    // Throws if invalid/expired/mismatched
    this.tokenService.validateRefreshToken(dto.refreshToken, userId);

    const payload: JwtPayload = { sub: userId };
    return {
      accessToken: this.tokenService.generateAccessToken(payload),
      refreshToken: this.tokenService.generateRefreshToken(payload),
    };
    // ✅ No `async` + no `await` ⇒ linter satisfied
  }

  /**
   * Revoke the current refresh token (logout).
   * NOTE: Synchronous; no `async` needed.
   * @route POST /auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Revoke current refresh token (logout)' })
  logout(@Req() req: AuthenticatedRequest): void {
    this.tokenService.revokeRefreshToken(req.user.userId);
  }

  /**
   * Validate user credentials with AuthService.
   * @throws UnauthorizedException when credentials are invalid.
   */
  private async validateUser(
    username: string,
    password: string,
  ): Promise<{ id: string; username: string; email: string }> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
