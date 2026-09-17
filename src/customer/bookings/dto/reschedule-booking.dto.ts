import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { BOOKING_DATE_REGEX, BOOKING_TIME_REGEX } from './create-booking.dto';

export class RescheduleCustomerBookingDto {
  @ApiProperty({ example: '2026-09-22' })
  @Matches(BOOKING_DATE_REGEX, { message: 'bookingDate must be YYYY-MM-DD' })
  bookingDate: string;

  @ApiProperty({ example: '14:00' })
  @Matches(BOOKING_TIME_REGEX, {
    message: 'startTime must be HH:MM or HH:MM:SS',
  })
  startTime: string;

  @ApiPropertyOptional({ example: 'Out of town that morning' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
