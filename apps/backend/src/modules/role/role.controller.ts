import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RoleService } from './role.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * List all roles
   */
  @Get()
  async listAll() {
    return this.roleService.listAll();
  }

  /**
   * Get a single role by UUID
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.roleService.getById(id);
  }

  /**
   * Create a new role
   */
  @Post()
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto.name, dto.description);
  }

  /**
   * Update an existing role
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.roleService.update(id, dto);
  }

  /**
   * Soft-delete a role
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.roleService.delete(id);
  }
}
