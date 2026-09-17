import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveAdminAgentDto {
  @ApiPropertyOptional({
    description: 'Internal note kept in the audit log',
    example: 'Aadhaar and PAN verified over call',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
