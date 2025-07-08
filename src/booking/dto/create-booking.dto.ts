import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'User ID who is making the booking' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
