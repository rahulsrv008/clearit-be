import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class AssignAdminBookingAgentDto {
  @ApiProperty({ description: 'agents.id of the agent to put on the job' })
  @IsUUID()
  agentId: string;

  @ApiPropertyOptional({ description: 'Stored on the status-history entry' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
