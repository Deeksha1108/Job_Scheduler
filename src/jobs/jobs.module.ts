import { Module, forwardRef } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './jobs.entity';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [TypeOrmModule.forFeature([Job]), forwardRef(() => BookingModule)],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
