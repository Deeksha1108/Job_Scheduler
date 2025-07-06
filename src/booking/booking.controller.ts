import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { logger } from 'src/logger/winston';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    const requestId = req.headers['x-request-id'] || 'N/A';
    const { userId } = createBookingDto;

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      logger.warn(
        `[${requestId}] Booking creation failed: Invalid or missing userId`,
      );
      throw new BadRequestException('Invalid request');
    }

    try {
      logger.info(
        `[${requestId}] Booking creation requested for userId: ${userId}`,
      );

      const booking = await this.bookingService.createBooking(userId);

      logger.info(
        `[${requestId}] Booking created successfully with ID: ${booking.id}`,
        { bookingId: booking.id, userId },
      );

      return {
        success: true,
        message: 'Booking created successfully',
        data: {
          bookingId: booking.id,
          status: booking.status,
          createdAt: booking.createdAt,
        },
      };
    } catch (error) {
      logger.error(
        `[${requestId}] Error while creating booking: ${error.message}`,
        {
          stack: error.stack,
          userId,
        },
      );

      throw new InternalServerErrorException(
        'Something went wrong. Please try again later.',
      );
    }
  }

  @Patch(':id/confirm')
  async confirm(@Param('id') id: string) {
    try {
      const booking = await this.bookingService.confirmBooking(id);

      return {
        success: true,
        message: 'Booking confirmed successfully',
        data: {
          id: booking.id,
          status: booking.status,
          updatedAt: booking.updatedAt,
        },
      };
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
}
