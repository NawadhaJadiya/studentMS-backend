import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('AdminService', () => {
  let service: AdminService;
  let repo: jest.Mocked<Repository<Admin>>;
  let jwtService: jest.Mocked<JwtService>;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService,
        {
          provide: getRepositoryToken(Admin),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
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

    service = module.get<AdminService>(AdminService);
    repo = module.get(getRepositoryToken(Admin));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return null if admin not found', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await service.validateAdmin('admin1', 'pass');

    expect(result).toBeNull();
  });

  it('should throw error if old password is incorrect', async () => {
    repo.findOne.mockResolvedValue({
      password: 'hashed',
    } as Admin);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.updatePasswordByuserName('admin1', 'old', 'new'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
