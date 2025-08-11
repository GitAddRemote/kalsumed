// apps/backend/src/modules/user/user.controller.ts

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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get the currently authenticated user's profile
   */
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.userService.getById(userId);
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
  async getById(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  /**
   * (ADMIN) Create a new user
   */
  @Roles('admin')
  @Post()
  async create(@Body() dto: CreateUserDto) {
    // Hash the incoming password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

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
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  /**
   * (ADMIN) Soft-delete a user
   */
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.userService.delete(id);
  }
}
