import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './jobs.entity';
import { LessThanOrEqual, Repository } from 'typeorm';

interface ScheduleJobInput {
  type: string;
  runAt: Date;
  payload: Record<string, any>;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepo: Repository<Job>,
  ) {}

  async scheduleJob(input: ScheduleJobInput) {
    const job = this.jobRepo.create({
      type: input.type,
      runAt: input.runAt,
      payload: input.payload,
    });

    return this.jobRepo.save(job);
  }

  async getDueJobs(): Promise<Job[]> {
    const now = new Date();
    return this.jobRepo.find({
      where: {
        runAt: LessThanOrEqual(now),
        status: 'pending',
      },
    });
  }

  async markJobCompleted(id: string) {
    await this.jobRepo.update(id, { status: 'completed' });
  }
}
