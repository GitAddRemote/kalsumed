import {
  Controller,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { OAuthService } from './oauth.service';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface OAuthProfile {
  provider: string;
  id: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

interface OAuthRequest extends Request {
  user: OAuthProfile;
}

@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly oauth: OAuthService,
    private readonly auth: AuthService,
  ) {}

  @Get('google')
  @HttpCode(HttpStatus.TEMPORARY_REDIRECT)
  googleAuth(@Res() res: Response): void {
    this.oauth.initiateGoogle(res);
  }

  @Get('google/callback')
  async googleCallback(@Req() req: OAuthRequest, @Res() res: Response) {
    const user = await this.oauth.handleGoogleCallback({
      provider: 'google',
      id: req.user.id,
    });
    const tokens = await this.auth.login(user);
    return this.oauth.finish(res, tokens);
  }

  @Get('github')
  @HttpCode(HttpStatus.TEMPORARY_REDIRECT)
  githubAuth(@Res() res: Response): void {
    this.oauth.initiateGithub(res);
  }

  @Get('github/callback')
  async githubCallback(@Req() req: OAuthRequest, @Res() res: Response) {
    const user = await this.oauth.handleGithubCallback({
      provider: 'github',
      id: req.user.id,
    });
    const tokens = await this.auth.login(user);
    return this.oauth.finish(res, tokens);
  }

  @Get('apple')
  @HttpCode(HttpStatus.TEMPORARY_REDIRECT)
  appleAuth(@Res() res: Response): void {
    this.oauth.initiateApple(res);
  }

  @Get('apple/callback')
  appleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('id_token') idToken?: string,
    @Query('state') state?: string,
    @Query('user') rawUser?: string,
  ) {
    return this.oauth.handleAppleCallback({
      req,
      res,
      ...(code && { code }),
      ...(idToken && { idToken }),
      ...(state && { state }),
      ...(rawUser && { rawUser }),
      issueTokens: async (user) => {
        const tokens = await this.auth.login(user);
        return this.oauth.finish(res, tokens);
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('unlink/:provider')
  async unlink(@Req() req: any, @Param('provider') provider: string, @Res() res: Response) {
    await this.oauth.unlink(req.user.sub, provider);
    res.status(HttpStatus.NO_CONTENT).send();
  }
}
