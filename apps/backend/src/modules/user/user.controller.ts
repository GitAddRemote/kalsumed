import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { User } from './entities/user.entity.js';

// Shape injected by auth strategy (expand as needed)
interface AuthUserPayload {
  userId: string;
  email?: string;
  roles?: string[];
}

interface AuthenticatedRequest extends Request {
  user: AuthUserPayload;
}

const PASSWORD_SALT_ROUNDS = 12;

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Return the currently authenticated user's profile
   */
  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest): Promise<User | null> {
    return this.userService.getById(req.user.userId);
  }

  /**
   * (ADMIN) List all users
   */
  @Roles('admin')
  @Get()
  async listUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  /**
   * (ADMIN) Fetch a user by UUID
   */
  @Roles('admin')
  @Get(':id')
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<User | null> {
    return this.userService.getById(id);
  }

  /**
   * (ADMIN) Create a new user (local auth)
   */
  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(
      dto.password,
      PASSWORD_SALT_ROUNDS,
    );
    return this.userService.createLocal(
      dto.username,
      dto.email,
      passwordHash,
    );
  }

  /**
   * (ADMIN) Update an existing user
   */
  @Roles('admin')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, dto);
  }

  /**
   * (ADMIN) Soft-delete a user
   */
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.userService.delete(id);
  }
}
