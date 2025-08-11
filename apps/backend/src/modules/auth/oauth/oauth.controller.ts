// apps/backend/src/modules/auth/oauth/oauth.controller.ts

import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthService } from './oauth.service';
import { Request, Response } from 'express';

@Controller('auth/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  // Initiate Google OAuth2 flow
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // passport redirects automatically
  }

  // Google callback endpoint
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    await this.oauthService.handleSocialLogin(
      {
        provider: 'google',
        id: (req.user as any).id,
        emails: (req.user as any).emails,
        name: (req.user as any).name,
        photos: (req.user as any).photos,
        accessToken: (req.user as any).accessToken,
        refreshToken: (req.user as any).refreshToken,
        expiresIn: (req.user as any).expiresIn,
      },
      res,
    );
  }

  // Similarly, Apple OAuth2 flow
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  appleAuth() {}

  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleCallback(@Req() req: Request, @Res() res: Response) {
    await this.oauthService.handleSocialLogin(
      {
        provider: 'apple',
        id: (req.user as any).id,
        emails: (req.user as any).emails,
        name: (req.user as any).name,
        accessToken: (req.user as any).accessToken,
        refreshToken: (req.user as any).refreshToken,
        expiresIn: (req.user as any).expiresIn,
      },
      res,
    );
  }
}
