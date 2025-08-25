import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Logger
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { OAuthService } from './oauth.service.js';

@Controller('auth/oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);
  constructor(private readonly _oauthService: OAuthService) {}

  // Initiate Google OAuth2 flow
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(): Promise<void> {
    // Handled by Google strategy
  }

  // Google callback endpoint
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // The user object is attached by the Google strategy
      const user = req.user as Express.User;

      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`);
      }

      // Generate JWT tokens for the authenticated user
      const tokens = await this._oauthService.handleOAuthLogin(user);

      // Set tokens as HTTP-only cookies for security
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend success page
      return res.redirect(`${process.env.FRONTEND_URL}/auth/success`);

    } catch (error) {
      this.logger.error('Google OAuth callback error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`);
    }
  }

  // // Similarly, Apple OAuth2 flow
  // @Get('apple')
  // @UseGuards(AuthGuard('apple'))
  // async appleAuth(): Promise<void> {
  //   throw new Error('Apple OAuth not implemented yet');
  // }
  //
  // @Get('apple/callback')
  // @UseGuards(AuthGuard('apple'))
  // async appleAuthCallback(
  //   @Req() req: Request,
  //   @Res() res: Response,
  //   @Query() query: any,
  //   @Headers() headers: any,
  //   @Session() session: any,
  //   @Param() params: any,
  // ): Promise<void> {
  //   // Handle Apple OAuth callback
  // }
}
