import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';

@Module({
  imports: [TypeOrmModule.forFeature([Student]), 
  JwtModule.register({
        secret: process.env.JWT_SECRET,       
        signOptions: { expiresIn: '1h' },
      }),
  AuthModule
],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
