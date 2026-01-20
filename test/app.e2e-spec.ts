import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('E2E Tests (Student + Admin)', () => {
  let app: INestApplication;

  let studentToken: string;
  let adminToken: string;

  const testStudent = {
    name: 'Test Student',
    rollno: 'e2e-101',
    password: 'password123',
    class: '10',
    email: 'e2e_student@test.com',
    phone: '9999999999',
  };

  const testAdmin = {
    user_name: 'admin',
    password: 'admin123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /students/login → login student', async () => {
    const res = await request(app.getHttpServer())
      .post('/students/login')
      .send({
        rollno: testStudent.rollno,
        password: testStudent.password,
      })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    studentToken = res.body.access_token;
  });

  it('GET /students/:rollno/result → get student result', async () => {
    const res = await request(app.getHttpServer())
      .get(`/students/${testStudent.rollno}/result`)
      .expect(200);

    expect(res.body.message).toBe('no history of marks');
    
  });


  it('POST /admin/login → invalid login', async () => {
  const res = await request(app.getHttpServer())
    .post('/admin/login')
    .send(testAdmin)
    .expect(201);

  expect(res.body.message).toBe('Invalid credentials');
});


  
});
