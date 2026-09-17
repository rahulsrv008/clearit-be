import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteAgentBookingDto {
  @ApiPropertyOptional({ example: 'Deep cleaned the kitchen as requested' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
