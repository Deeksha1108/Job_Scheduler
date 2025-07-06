import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Booking } from '../booking/booking.entity';
import { Job } from '../jobs/jobs.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

function validateEnv(variable: string, fallback?: string): string {
  const value = process.env[variable] || fallback;
  if (!value) {
    throw new Error(`Environment variable ${variable} is required`);
  }
  return value;
}

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: validateEnv('DATABASE_HOST', 'localhost'),
  port: parseInt(validateEnv('DATABASE_PORT', '5432'), 10),
  username: validateEnv('DATABASE_USER', 'postgres'),
  password: validateEnv('DATABASE_PASSWORD', 'admin'),
  database: validateEnv('DATABASE_NAME', 'job_scheduler'),

  entities: [Booking, Job],

  synchronize: false,
  logging: false,

  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
  migrationsRun: true,

  retryAttempts: 5,
  retryDelay: 3000,

  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
};
