import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, Length } from 'class-validator';

export class StartAgentBookingDto {
  @ApiProperty({ example: '1234', description: 'OTP the customer reads out' })
  @IsNumberString()
  @Length(4, 6)
  otp: string;
}
