import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CancelAdminBookingDto {
  @ApiProperty({
    description: 'Shared with the customer and the assigned agent',
    example: 'Customer requested cancellation over the phone',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason: string;
}
