import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ReassignAdminBookingAgentDto {
  @ApiProperty({ description: 'agents.id of the replacement agent' })
  @IsUUID()
  agentId: string;

  @ApiProperty({
    description: 'Why the job is moving, shared with both agents',
    example: 'Original agent is unwell',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason: string;
}
