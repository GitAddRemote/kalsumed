// src/modules/permission/permission.controller.ts
import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { Permission } from './entities/permission.entity';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async findAll(): Promise<Permission[]> {
    return this.permissionService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Permission> {
    return this.permissionService.findById(id);
  }

  @Post()
  async create(@Body() data: Partial<Permission>): Promise<Permission> {
    return this.permissionService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Permission>): Promise<Permission> {
    return this.permissionService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.permissionService.delete(id);
  }
}
