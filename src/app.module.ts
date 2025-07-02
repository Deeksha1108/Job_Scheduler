import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { SchedulerService } from './scheduler/scheduler.service';
import { JobsModule } from './jobs/jobs.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), BookingModule, JobsModule],
  controllers: [],
  providers: [SchedulerService],
})
export class AppModule {}
