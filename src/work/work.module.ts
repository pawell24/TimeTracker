import { Module } from '@nestjs/common';
import { WorkService } from './work.service';
import { UsersModule } from '../users/users.module';
import { WorkController } from './work.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { Work } from './entities/work.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [WorkService, JwtService],
  imports: [TypeOrmModule.forFeature([Work]), UsersModule, AuthModule],
  controllers: [WorkController],
})
export class WorkModule {}
