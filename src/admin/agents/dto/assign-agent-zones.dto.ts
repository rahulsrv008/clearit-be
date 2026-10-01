import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class AssignAdminAgentZonesDto {
  @ApiProperty({
    type: [String],
    description: 'Service zones this agent is allowed to work in',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Assign at least one service location' })
  @IsUUID('4', { each: true })
  serviceAreaIds: string[];

  @ApiPropertyOptional({ description: 'Home zone for this agent' })
  @IsOptional()
  @IsUUID('4')
  homeZoneId?: string | null;
}
