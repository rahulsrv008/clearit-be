import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SuspendAdminAgentDto {
  @ApiProperty({
    description: 'Sent to the agent with the suspension notice',
    example: 'Multiple no-shows this week',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason: string;
}
