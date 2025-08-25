import { Controller, Get, Post, Req, Res, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import { SessionService } from './session.service.js';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @HttpCode(200)
  getSession(@Req() req: Request) {
    return { session: this.sessionService.getSessionData(req) };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.sessionService.destroySession(req);
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure:
        req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'none',
    });
    return res.send({ message: 'Logged out successfully' });
  }
}
