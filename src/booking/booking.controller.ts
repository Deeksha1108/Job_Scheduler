import { Controller, Post, Body } from '@nestjs/common';
import { BookingService } from './booking.service';

@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  async create(@Body('userId') userId: string) {
    console.log('Booking created...');
    return this.bookingService.createBooking(userId);
  }
}
