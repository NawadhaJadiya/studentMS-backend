import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private adminRepo: Repository<Admin>,
        private jwtService: JwtService
    ) {}

    async createAdmin(data: Partial<Admin>) {
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    const admin = this.adminRepo.create(data as Admin);
    const saved = await this.adminRepo.save(admin);
    const { password, ...result } = saved as any;
    return result as Admin;
  }

  async validateAdmin(user_name: string, password: string) {
      const admin = await this.adminRepo.findOne({ where: { user_name } });
      if (!admin) return null;
      
      const matches = await bcrypt.compare(password, admin.password);
      if (!matches) return null;
      const payload = {
      sub: admin.id,
      user_name: admin.user_name,
      role: 'admin',
    };

    return {
      access_token: this.jwtService.sign(payload),
      };
    }

    async updatePasswordByuserName(user_name: string, oldPassword: string, newPassword: string) {
        const admin = await this.adminRepo.findOne({ where: { user_name }, select : ['password'] });
        if (!admin) return "admin not found";
        const matches = await bcrypt.compare(oldPassword, admin.password);
        if (!matches) throw new UnauthorizedException('Old password is incorrect');
      
        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(newPassword, salt);
        await this.adminRepo.update(
        { user_name },
        { password: hashed_password },
      );
    }

}
