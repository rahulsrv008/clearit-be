import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCustomerTicketDto {
  @ApiProperty({ example: 'Agent did not arrive' })
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: 'Nobody turned up for my 10am slot.' })
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiPropertyOptional({ description: 'Booking this ticket is about' })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'NORMAL', 'HIGH'], default: 'NORMAL' })
  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH'])
  priority?: string;
}
