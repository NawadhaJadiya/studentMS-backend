import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    private jwtService: JwtService
  ) {}

  
  async createStudent(data: Partial<Student>) {
    
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    const student = this.studentRepo.create(data as Student);
    const saved = await this.studentRepo.save(student);
    const payload = {
      sub : student.id, 
      rollno: student.rollno,
      role: 'student',
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  getAllStudents() {
    return this.studentRepo.find({ select: ['id', 'name', 'rollno', 'class', 'marks'] });
  }

  updateStudent(id: number, data: Partial<Student>) {
    return this.studentRepo.update(id, data);
  }

  
  deleteStudent(id: number) {
    return this.studentRepo.delete(id);
  }

  async validateStudent(rollno: string, password: string) {
    const student = await this.studentRepo.findOne({ where: { rollno } });

    if (!student) return null;
    console.log(student);
    const matches = await bcrypt.compare(password, student.password);
    if (!matches) return null;
    const payload = {
      sub : student.id, 
      rollno: student.rollno,
      role: 'student',
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async updatePasswordByRollno(rollno: string, oldPassword: string, newPassword: string) {
    const student = await this.studentRepo.findOne({ where: { rollno }, select : ['password'] });
    if (!student) return "student not found";
    const matches = await bcrypt.compare(oldPassword, student.password);
    if (!matches) throw new UnauthorizedException('Old password is incorrect');
    const salt = await bcrypt.genSalt(10);
    const hashed_password = await bcrypt.hash(newPassword, salt);
    await this.studentRepo.update(
    { rollno },
    { password: hashed_password },
  );

  return { message: 'Password updated successfully' };

  }
  async getResultByRollno(rollno: string) {
    const student = await this.studentRepo.findOne({ where: { rollno }, select: ['id', 'name', 'rollno', 'marks'] });
    if (!student) return null;

    const marks = student.marks;
    if (!marks) {
      return { message: 'no history of marks' };
    }

    
    let entries: Array<{ subject: string; score: number }> = [];

    if (Array.isArray(marks)) {
      
      entries = marks.map((m: any) => ({ subject: m.subject, score: Number(m.score) }));
    } else if (typeof marks === 'object') {
      
      entries = Object.keys(marks).map((k) => ({ subject: k, score: Number((marks as any)[k]) }));
    }

    const total = entries.reduce((acc, cur) => acc + (Number(cur.score) || 0), 0);
    const percentage = entries.length ? total / entries.length : 0;

    return {
      rollno: student.rollno,
      name: student.name,
      marks: entries,
      percentage,
    };
  }

  async getStudentByRollno(rollno: string) {
    const student = await this.studentRepo.findOne({ where: { rollno }, select: ['id', 'name', 'rollno', 'marks', 'class', 'email', 'phone', 'addressLine1', 'addressLine2'] });
    if (!student) return null;
    return {
      rollno: student.rollno,
      name: student.name,
      marks: student.marks,
      class: student.class,
      email: student.email,
      phone: student.phone,
      addressLine1: student.addressLine1,
      addressLine2: student.addressLine2,
    };
  }

  async updateMarksByRollno(rollno: string, marksInput: any) {
    const student = await this.studentRepo.findOne({ where: { rollno } });
    if (!student) return null;

    const existing = student.marks;
    let entries: Array<{ subject: string; score: number }> = [];
    if (Array.isArray(existing)) {
      entries = existing.map((m: any) => ({ subject: m.subject, score: Number(m.score) }));
    } else if (existing && typeof existing === 'object') {
      entries = Object.keys(existing).map((k) => ({ subject: k, score: Number((existing as any)[k]) }));
    }

    let incoming: Array<{ subject: string; score: number }> = [];
    if (Array.isArray(marksInput)) {
      incoming = marksInput.map((m: any) => ({ subject: m.subject, score: Number(m.score) }));
    } else if (marksInput && typeof marksInput === 'object') {
      incoming = Object.keys(marksInput).map((k) => ({ subject: k, score: Number((marksInput as any)[k]) }));
    } else {
      
      return { message: 'no marks provided' };
    }

    
    const map = new Map(entries.map((e) => [e.subject, e]));
    incoming.forEach((inc) => {
      map.set(inc.subject, { subject: inc.subject, score: Number(inc.score) });
    });

    const merged = Array.from(map.values());

    student.marks = merged;
    const saved = await this.studentRepo.save(student);

    const total = merged.reduce((acc, cur) => acc + (Number(cur.score) || 0), 0);
    const percentage = merged.length ? total / merged.length : 0;

    return {
      rollno: saved.rollno,
      name: saved.name,
      marks: merged,
      percentage,
    };
  }

  async deleteByRollno(rollno: string) {
    const res = await this.studentRepo.delete({ rollno });
    return { affected: res.affected };
  }
}
