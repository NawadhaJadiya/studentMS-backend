import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), 
  JwtModule.register({
      secret: 'secretEncryptionKey',       
      signOptions: { expiresIn: '1h' },
    }),
  AuthModule
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
