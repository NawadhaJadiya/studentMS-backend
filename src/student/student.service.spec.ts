import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('StudentService', () => {
  let service: StudentService;
  let repo: jest.Mocked<Repository<Student>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        {
          provide: getRepositoryToken(Student),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    repo = module.get(getRepositoryToken(Student));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a student and return access token', async () => {
    const data = {
      name: 'dummy',
      rollno: '101',
      password: 'plain123',
    };

    repo.create.mockReturnValue(data as Student);
    repo.save.mockResolvedValue({ id: 1, rollno: '101' } as Student);
    jwtService.sign.mockReturnValue('mock-token');

    const result = await service.createStudent(data);

    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result.access_token).toBe('mock-token');
  });

  
  it('should validate student and return token', async () => {
    const student = {
      id: 1,
      rollno: '101',
      password: 'hashed',
    } as Student;

    repo.findOne.mockResolvedValue(student);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('jwt-token');

    const result = await service.validateStudent('101', 'pass');

    expect(result?.access_token).toBe('jwt-token');
  });

  
});
