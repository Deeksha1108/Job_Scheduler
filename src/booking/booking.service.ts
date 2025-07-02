import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './booking.entity';
import { Repository } from 'typeorm';
import { JobsService } from '../jobs/jobs.service';
import { addMinutes } from 'date-fns';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    private jobsService: JobsService,
  ) {}

  async createBooking(userId: string) {
    const booking = this.bookingRepo.create({ userId });
    const saved = await this.bookingRepo.save(booking);

    await this.jobsService.scheduleJob({
      type: 'cancel-booking',
      runAt: addMinutes(new Date(), 2),
      payload: { bookingId: saved.id },
    });

    return saved;
  }

  async cancelBooking(bookingId: string) {
    await this.bookingRepo.update(bookingId, { status: 'cancelled' });
  }
}
