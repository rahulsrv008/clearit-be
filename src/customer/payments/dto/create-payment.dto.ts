import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCustomerPaymentDto {
  @ApiProperty({ description: 'Booking to collect payment for' })
  @IsUUID()
  bookingId: string;
}
