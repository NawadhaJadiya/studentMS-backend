import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentModule } from './student/student.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import 'dotenv/config';


@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true, 
    // }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URI,
      autoLoadEntities: true,
      synchronize: true,
    }),
    StudentModule,
    AdminModule,
  ],
})
export class AppModule {
  
}
