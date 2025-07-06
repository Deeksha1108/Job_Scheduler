import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { BookingService } from '../booking/booking.service';
import { addMinutes } from 'date-fns';
import { logger } from 'src/logger/winston';
import { BookingStatus } from 'src/booking/booking.entity';

@Injectable()
export class SchedulerService {
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly jobsService: JobsService,
    private readonly bookingService: BookingService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleScheduledJobs() {
    logger.info(
      `[SCHEDULER] Running scheduled job poll at ${new Date().toISOString()}`,
    );
    try {
      const dueJobs = await this.jobsService.getDueJobs();

      for (const job of dueJobs) {
        logger.info(
          `[SCHEDULER] Scheduler Processing Job ID: ${job.id} | Type: ${job.type}`,
        );

        let attempts = 0;
        let success = false;

        while (attempts < this.MAX_RETRIES && !success) {
          try {
            logger.debug(
              `[SCHEDULER] Scheduler Attempting to lock job ${job.id} (Attempt: ${attempts + 1})`,
            );

            await this.jobsService.lockJob(job.id);
            if (job.type === 'cancel-booking') {
              const { bookingId } = job.payload;

              logger.info(
                `[SCHEDULER] Handling to cancel booking: ${bookingId} for job ${job.id}`,
              );

              const booking = await this.bookingService.findById(bookingId);

              if (!booking) {
                logger.warn(
                  `[SCHEDULER] Booking not found for ID: ${bookingId}. Skipping job.`,
                );
                await this.jobsService.markJobCompleted(
                  job.id,
                  job.isRecurring,
                );
                break;
              }

              if (booking.status === BookingStatus.CONFIRMED) {
                logger.warn(
                  `[SCHEDULER] Booking ${bookingId} is already CONFIRMED. Skipping job ${job.id}`,
                );
                await this.jobsService.markJobCompleted(
                  job.id,
                  job.isRecurring,
                );
                break;
              }

              await this.bookingService.cancelBooking(bookingId);

              if (job.isRecurring) {
                const nextRunAt = addMinutes(new Date(), 2);
                await this.jobsService.markJobCompleted(
                  job.id,
                  true,
                  nextRunAt,
                );
                logger.info(
                  `[SCHEDULER] Scheduler Recurring job ${job.id} rescheduled at ${nextRunAt}`,
                );
              } else {
                await this.jobsService.markJobCompleted(job.id, false);
                logger.info(
                  `[SCHEDULER] Scheduler Job ${job.id} marked completed for booking ${bookingId}`,
                );
              }
            } else {
              logger.warn(
                `[SCHEDULER] Unknown job type "${job.type}" for job ${job.id}`,
              );
            }

            success = true;
          } catch (jobError) {
            attempts++;
            logger.error(
              `[SCHEDULER] Attempt ${attempts} failed for job ${job.id}: ${jobError.message}`,
              { stack: jobError.stack },
            );

            if (attempts >= this.MAX_RETRIES) {
              logger.error(
                `[SCHEDULER] Scheduler Job ${job.id} failed after ${this.MAX_RETRIES} retries.`,
              );
            }
          }
        }
      }
    } catch (error) {
      logger.error('[SCHEDULER] Scheduler failed while polling jobs', {
        message: error.message,
        stack: error.stack,
      });
    }
  }
}
