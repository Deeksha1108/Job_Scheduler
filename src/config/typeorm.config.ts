import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Booking } from '../booking/booking.entity';
import { Job } from '../jobs/jobs.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'admin',
  database: process.env.DATABASE_NAME || 'job_scheduler',
  entities: [Booking, Job],
  synchronize: true,
};
