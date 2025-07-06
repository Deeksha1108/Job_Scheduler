import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Job, JobStatus } from './jobs.entity';
import { logger } from 'src/logger/winston';

interface ScheduleJobInput {
  type: string;
  runAt: Date;
  payload: Record<string, any>;
  isRecurring?: boolean;
  metadata?: Record<string, any>;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
  ) {}
  async scheduleJob(input: ScheduleJobInput): Promise<Job> {
    logger.info(
      `[JOB] Scheduling new job | Type: ${input.type} | RunAt: ${input.runAt}`,
    );

    try {
      const job = this.jobRepo.create({
        type: input.type,
        runAt: input.runAt,
        payload: input.payload,
        isRecurring: input.isRecurring ?? false,
        metadata: input.metadata ?? {},
        status: JobStatus.PENDING,
        locked: false,
      });

      const savedJob = await this.jobRepo.save(job);
      logger.info(
        `[JOB] Job scheduled [${savedJob.type}] - ID: ${savedJob.id} - RunAt: ${savedJob.runAt}`,
      );
      return savedJob;
    } catch (error) {
      logger.error(`Failed to schedule job: ${error.message}`, {
        stack: error.stack,
      });
      throw new InternalServerErrorException(
        'Unable to schedule request. Please try again shortly.',
      );
    }
  }
  async getDueJobs(): Promise<Job[]> {
    logger.debug('[JOB] Fetching due jobs...');
    try {
      const now = new Date();
      const jobs = await this.jobRepo.find({
        where: {
          runAt: LessThanOrEqual(now),
          status: JobStatus.PENDING,
          locked: false,
        },
      });

      if (jobs.length > 0) {
        logger.info(
          `[JOB] Due jobs ready to run: ${jobs.map((j) => j.id).join(', ')}`,
        );
      } else {
        logger.debug('[JOB] No due jobs found at this time.');
      }
      return jobs;
    } catch (error) {
      logger.error(`[JOB] Error fetching due jobs: ${error.message}`, {
        stack: error.stack,
      });
      throw new InternalServerErrorException(
        'An unexpected error occurred. Please try again.',
      );
    }
  }
  async lockJob(id: string): Promise<void> {
    logger.debug(`[JOB] Attempting to lock job: ${id}`);
    try {
      await this.jobRepo.update(id, { locked: true });
      logger.debug(`[JOB] Job locked successfully: ${id}`);
    } catch (error) {
      logger.error(`[JOB] Failed to lock job ${id}: ${error.message}`, {
        stack: error.stack,
      });
      throw new InternalServerErrorException(
        'Unable to process your request at the moment.',
      );
    }
  }
  async markJobCompleted(
    id: string,
    isRecurring: boolean,
    nextRunAt?: Date,
  ): Promise<void> {
    logger.debug(
      `[JOB] Marking job completed | ID: ${id} | Recurring: ${isRecurring}`,
    );
    try {
      const updatePayload: Partial<Job> = {
        lastRunAt: new Date(),
        locked: false,
        status: isRecurring ? JobStatus.PENDING : JobStatus.COMPLETED,
      };

      if (isRecurring && nextRunAt) {
        updatePayload.runAt = nextRunAt;
      }

      await this.jobRepo.update(id, updatePayload);

      logger.info(
        isRecurring
          ? `[JOB] Job ${id} marked completed & rescheduled at ${nextRunAt}`
          : `[JOB] Job ${id} marked completed successfully`,
      );
    } catch (error) {
      logger.error(`[JOB] Failed to complete job ${id}: ${error.message}`, {
        stack: error.stack,
      });
      throw new InternalServerErrorException(
        'Something went wrong. Please try again later.',
      );
    }
  }
  calculateNextRunAt(currentRun: Date): Date {
    return new Date(currentRun.getTime() + 60 * 1000);
  }
}
