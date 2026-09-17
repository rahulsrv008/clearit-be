import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectAgentBookingDto {
  @ApiPropertyOptional({ example: 'Too far from my area' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
