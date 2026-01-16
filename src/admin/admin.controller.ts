
import { Body, Controller, Post, Put, Req, NotFoundException, ForbiddenException, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginDto } from './dto/login.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePasswordDto } from '../admin/dto/update-password.dto';


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Body() createDto: CreateAdminDto) {
    if (req.user.role !== 'admin') {
    throw new ForbiddenException('Only admins can create admins');
  }
    return this.adminService.createAdmin(createDto as any);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const admin = await this.adminService.validateAdmin(dto.user_name, dto.password);
    if (!admin) {
      return { status: 401, message: 'Invalid credentials' };
    }
    return admin;
  }

  @UseGuards(JwtAuthGuard)
    @Put(':user_name/password')
    async updatePassword(@Req() req, @Param('user_name') user_name: string, @Body() dto: UpdatePasswordDto) {
      if(req.user.user_name !== user_name) {
        throw new ForbiddenException('You can only change your own password');
      }
      const res = await this.adminService.updatePasswordByuserName(user_name, dto.oldPassword, dto.newPassword);
      if (res === null) throw new NotFoundException('admin not found or old password incorrect');
      return res;
    }
}