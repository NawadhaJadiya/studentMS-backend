import { Body, Controller, Get, Post, Param, NotFoundException, Delete, Patch, Put, Req, ForbiddenException } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  async create(@Body() createDto: CreateStudentDto) {
    return this.studentService.createStudent(createDto as any);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const student = await this.studentService.validateStudent(dto.rollno, dto.password);
    if (!student) {
      return { status: 401, message: 'Invalid credentials' };
    }
    return student;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    if (req.user.role !== 'admin') {
        throw new ForbiddenException('Only admins can view all students');
      }
    return this.studentService.getAllStudents();
  }
  @UseGuards(JwtAuthGuard)
  @Get(':rollno')
  async findByRollno(@Req() req, @Param('rollno') rollno: string) {
    if(req.user.rollno !== rollno && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only access your own data');
    }
    const student = await this.studentService.getStudentByRollno(rollno);
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  @Get(':rollno/result')
  async getResult(@Param('rollno') rollno: string) {
    const result = await this.studentService.getResultByRollno(rollno);
    if (result === null) throw new NotFoundException('Student not found');
    return result;
  }

  @Delete(':rollno')
  async deleteByRollno(@Param('rollno') rollno: string) {
    const res = await this.studentService.deleteByRollno(rollno);
    if (!res || !res.affected) {
      throw new NotFoundException('Student not found or already deleted');
    }
    return { message: 'Student deleted', affected: res.affected };
  }
  
  @UseGuards(JwtAuthGuard)
  @Put(':rollno/marks')
  async updateMarks(@Param('rollno') rollno: string, @Body('marks') marks: any, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can update student marks');
    }
    const res = await this.studentService.updateMarksByRollno(rollno, marks);
    if (res === null) throw new NotFoundException('Student not found');
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':rollno/password')
  async updatePassword(@Req() req, @Param('rollno') rollno: string, @Body() dto: UpdatePasswordDto) {
    if(req.user.rollno !== rollno) {
      throw new ForbiddenException('You can only change your own password');
    }
    const res = await this.studentService.updatePasswordByRollno(rollno, dto.oldPassword, dto.newPassword);
    if (res === null) throw new NotFoundException('Student not found or old password incorrect');
    return res;
  }

}
