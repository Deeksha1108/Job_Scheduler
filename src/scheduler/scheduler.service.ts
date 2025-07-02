import { Injectable, OnModuleInit } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(
    private jobsService: JobsService,
    private bookingService: BookingService,
  ) {}

  onModuleInit() {
    this.startPolling();
  }

  startPolling() {
    console.log('Scheduler started...');

    setInterval(async () => {
      try {
        const dueJobs = await this.jobsService.getDueJobs();
        for (const job of dueJobs) {
          if (job.type === 'cancel-booking') {
            const { bookingId } = job.payload;
            console.log(`Running job to cancel booking: ${bookingId}`);
            await this.bookingService.cancelBooking(bookingId);
            await this.jobsService.markJobCompleted(job.id);
            console.log(`Booking ${bookingId} cancelled & job marked done`);
          }
        }
      } catch (error) {
        console.error('Error while running scheduler:', error);
      }
    }, 10000);
  }
}
