import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from '../modules/database/seeder.service';
import { User } from '../modules/user/entities/user.entity';
import { Role } from '../modules/role/entities/role.entity';
import { UserRole } from '../modules/user/entities/user-role.entity';
import { Permission } from '../modules/permission/entities/permission.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User, Role, UserRole, Permission]),
  ],
  providers: [SeederService],
})
export class SeedModule {}
