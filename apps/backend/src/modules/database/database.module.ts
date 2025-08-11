import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../entities/role.entity';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/user-role.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole])],
  providers: [SeederService],
  exports: [SeederService],
})
export class DatabaseModule {}