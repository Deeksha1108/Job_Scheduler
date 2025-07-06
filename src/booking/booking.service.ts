import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
import { JobsService } from '../jobs/jobs.service';
import { addMinutes } from 'date-fns';
import { logger } from 'src/logger/winston';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    private jobsService: JobsService,
  ) {}

  async createBooking(userId: string): Promise<Booking> {
    logger.info(`[BOOKING] Creating new booking for user: ${userId}`);
    try {
      const booking = this.bookingRepo.create({ userId });
      const saved = await this.bookingRepo.save(booking);

      logger.info(
        `[BOOKING] Booking created with ID: ${saved.id} for userId: ${userId}`,
      );

      await this.jobsService.scheduleJob({
        type: 'cancel-booking',
        runAt: addMinutes(new Date(), 2),
        payload: { bookingId: saved.id },
        isRecurring: false,
        metadata: {
          createdBy: 'BookingService',
          module: 'booking',
          description: 'Auto-cancel booking if not confirmed in 2 minutes',
        },
      });

      logger.info(
        `[BOOKING] Auto-cancel job scheduled for booking ID: ${saved.id}`,
      );
      return saved;
    } catch (error) {
      logger.error(`[BOOKING] Error while creating booking: ${error.message}`, {
        stack: error.stack,
        userId,
      });
      throw new InternalServerErrorException(
        'Something went wrong. Please try again later.',
      );
    }
  }

  async cancelBooking(bookingId: string): Promise<void> {
    logger.info(`[BOOKING] Booking cancel attempt for ID: ${bookingId}`);
    try {
      const booking = await this.bookingRepo.findOne({
        where: { id: bookingId },
      });

      if (!booking) {
        logger.warn(
          `[BOOKING] Booking not found for cancellation: ${bookingId}`,
        );
        throw new NotFoundException('Not found!');
      }

      logger.info(
        `[BOOKING] Booking fetched | ID: ${booking.id} | Current status: ${booking.status}`,
      );

      if (booking.status === BookingStatus.CANCELLED) {
        logger.warn(`[BOOKING] Booking already cancelled: ${bookingId}`);
        return;
      }

      if (booking.status === BookingStatus.CONFIRMED) {
        logger.warn(
          `[BOOKING] Cannot auto-cancel a confirmed booking: ${bookingId}`,
        );
        return;
      }

      booking.status = BookingStatus.CANCELLED;
      await this.bookingRepo.save(booking);
      logger.info(`[BOOKING] Booking cancelled successfully: ${bookingId}`);
    } catch (error) {
      logger.error(
        `[BOOKING] Error while cancelling booking: ${error.message}`,
        {
          stack: error.stack,
          bookingId,
        },
      );
      throw new InternalServerErrorException(
        'Something went wrong. Please try again later.',
      );
    }
  }

  async confirmBooking(id: string): Promise<Booking> {
    try {
      const booking = await this.bookingRepo.findOne({ where: { id } });

      if (!booking) {
        logger.warn(`[CONFIRM] Booking not found: ${id}`);
        throw new NotFoundException('Not found!');
      }

      if (booking.status === BookingStatus.CANCELLED) {
        logger.warn(
          `[SECURITY] Cannot confirm a booking that's already CANCELLED: ${id}`,
        );
        throw new InternalServerErrorException(
          'Something went wrong. Please try again later.',
        );
      }

      if (booking.status === BookingStatus.CONFIRMED) {
        logger.info(`[CONFIRM] Booking already confirmed: ${id}`);
        return booking;
      }

      booking.status = BookingStatus.CONFIRMED;
      const updated = await this.bookingRepo.save(booking);

      logger.info(`[CONFIRM] Booking manually confirmed | ID: ${updated.id}`);
      return updated;
    } catch (error) {
      logger.error(
        `[CONFIRM] Error while confirming booking ${id}: ${error.message}`,
        {
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        'Something went wrong. Please try again later.',
      );
    }
  }

  async findById(id: string): Promise<Booking | null> {
    return this.bookingRepo.findOne({ where: { id } });
  }
}
