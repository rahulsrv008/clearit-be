import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const SUPPORT_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

export class CreateAgentSupportTicketDto {
  @ApiProperty({ example: 'Customer was not at home' })
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    example: 'I waited 20 minutes at the address and nobody answered.',
  })
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiPropertyOptional({ description: 'Must be one of this agent bookings' })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiPropertyOptional({ enum: SUPPORT_PRIORITIES, default: 'NORMAL' })
  @IsOptional()
  @IsIn([...SUPPORT_PRIORITIES])
  priority?: string;
}
