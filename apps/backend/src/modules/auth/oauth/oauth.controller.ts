// apps/backend/src/modules/auth/oauth/oauth.controller.ts

import { 
  Controller, 
  Get, 
  Req, 
  Res, 
  UseGuards,
  Query,
  Headers,
  Session,
  Param,
  Logger  // ✅ Add Logger import
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { OAuthService } from './oauth.service';

// Define OAuth user type
interface OAuthUser {
  id: string;
  provider: string;
  emails?: Array<{ value: string; verified?: boolean }>;
  displayName?: string;
  photos?: Array<{ value: string }>;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: OAuthUser;
}

@Controller('auth/oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name); // ✅ Add logger

  constructor(private readonly _oauthService: OAuthService) {}

  // Initiate Google OAuth2 flow
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(): Promise<void> {
    // The AuthGuard('google') handles the entire OAuth initiation
    // This function body will never execute in normal flow
  }

  // Google callback endpoint
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // The user object is attached by the Google strategy
      const user = req.user;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/error?message=Authentication failed`);
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
      return res.redirect(`${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/success`);
      
    } catch (error) {
      this.logger.error('Google OAuth callback error:', error); // ✅ Use logger instead of console
      return res.redirect(`${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/error?message=Authentication failed`);
    }
  }

  // Apple OAuth2 flow
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  async appleAuth(): Promise<void> {
    // This initiates the Apple OAuth flow - handled by Apple strategy
    // User will be redirected to Apple's authorization server
  }

  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleAuthCallback(
    @Req() _req: AuthenticatedRequest,
    @Res() _res: Response,
    @Query() _query: Record<string, string>,
    @Headers() _headers: Record<string, string | string[]>,
    @Session() _session: Record<string, unknown>,
    @Param() _params: Record<string, string>,
  ): Promise<void> {
    // Handle Apple OAuth callback - similar to Google
    throw new Error('Apple OAuth callback not implemented yet');
  }
}
