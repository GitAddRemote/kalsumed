// apps/backend/src/modules/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  /** Public login endpoint */
  @Post('login')
  @HttpCode(200)
  async login(@Body() credentials: LoginDto) {
    return this._authService.login(credentials);
  }

  /** Protected refresh endpoint */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request & { user: { userId: string; username: string } },
  ) {
    return this._authService.refresh(req.user);
  }
}
