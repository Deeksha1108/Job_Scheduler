import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Booking } from 'src/booking/booking.entity';
import { Job } from 'src/jobs/jobs.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'admin',
  database: process.env.DATABASE_NAME || 'job_scheduler',
  entities: [Booking, Job],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
});
