import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate user credentials against stored password hash
   * @param username - The user's username or email
   * @param password - The plain-text password to verify
   * @returns The user object if valid, otherwise null
   */
  private async validateUser(
    username: string,
    password: string,
  ): Promise<{ id: string; username: string; passwordHash: string } | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (isMatch) {
        const { passwordHash, ...result } = user;
        return result as any;
      }
    }
    return null;
  }

  /**
   * Login with credentials and receive access & refresh tokens
   * @param loginDto - Contains username and password
   */
  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Refresh tokens using a valid JWT payload
   * @param user - The decoded JWT payload from the request
   */
  async refresh(
    user: { userId: string; username: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { username: user.username, sub: user.userId };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    return { accessToken, refreshToken };
  }
}
