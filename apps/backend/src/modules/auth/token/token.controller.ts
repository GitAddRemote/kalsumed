// apps/backend/src/modules/auth/token/token.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TokenService } from './token.service';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokensDto } from './dto/token.dto';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Log in and receive access & refresh tokens' })
  @ApiResponse({ status: 200, type: TokensDto })
  async login(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: LoginDto,
  ): Promise<TokensDto> {
    // 🔒 TODO: replace with your real user lookup
    const user = await this.validateUser(dto.username, dto.password);
    const payload = { sub: user.id, username: user.username };

    return {
      accessToken: this.tokenService.generateAccessToken(payload),
      refreshToken: this.tokenService.generateRefreshToken(payload),
    };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange a valid refresh token for new tokens' })
  @ApiResponse({ status: 200, type: TokensDto })
  async refresh(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    dto: RefreshTokenDto,
    @Req() req: any,
  ): Promise<TokensDto> {
    const userId = req.user.userId;
    this.tokenService.validateRefreshToken(dto.refreshToken, userId);

    const payload = { sub: userId };
    return {
      accessToken: this.tokenService.generateAccessToken(payload),
      refreshToken: this.tokenService.generateRefreshToken(payload),
    };
  }

  // Example logout endpoint (revokes refresh tokens)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Revoke current refresh token (logout)' })
  logout(@Req() req: any): void {
    this.tokenService.revokeRefreshToken(req.user.userId);
  }

  private async validateUser(username: string, password: string) {
    // stub: replace with your UsersService + bcrypt.compare
    return { id: 'user-uuid', username };
  }
}
