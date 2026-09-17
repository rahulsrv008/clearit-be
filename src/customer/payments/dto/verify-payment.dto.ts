import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class VerifyCustomerPaymentDto {
  @ApiProperty({ description: 'Booking the checkout belonged to' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ example: 'order_MnZ1kQ9pXy' })
  @IsString()
  @MaxLength(150)
  razorpayOrderId: string;

  @ApiProperty({ example: 'pay_MnZ1kQ9pXy' })
  @IsString()
  @MaxLength(150)
  razorpayPaymentId: string;

  @ApiPropertyOptional({ description: 'Checkout callback signature' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  razorpaySignature?: string;
}
