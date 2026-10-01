import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ApproveAdminAgentDto {
  @ApiProperty({
    type: [String],
    description: 'Service zones this agent is allowed to work in',
    example: ['uuid-noida-north'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Assign at least one service location' })
  @IsUUID('4', { each: true })
  serviceAreaIds: string[];

  @ApiPropertyOptional({
    description: 'Home zone for this agent. Defaults to the zone resolved from their address.',
  })
  @IsOptional()
  @IsUUID('4')
  homeZoneId?: string;

  @ApiPropertyOptional({
    description: 'Internal note kept in the audit log',
    example: 'Aadhaar and PAN verified over call',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
