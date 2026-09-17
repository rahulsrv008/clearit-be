import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RejectAdminAgentDto {
  @ApiProperty({
    description: 'Sent to the agent so they know what to fix',
    example: 'Aadhaar image is unreadable',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason: string;
}
