import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export const TRAINING_STATUSES = [
  'UNVERIFIED',
  'IN_TRAINING',
  'VERIFIED',
] as const;

export class AgentSkillSelectionDto {
  @ApiProperty({
    example: 'home_cleaning',
    description: 'Stable skill code from the catalog',
  })
  @IsString()
  skillId: string;

  @ApiProperty()
  @IsBoolean()
  selected: boolean;

  @ApiPropertyOptional({ enum: TRAINING_STATUSES })
  @IsOptional()
  @IsIn([...TRAINING_STATUSES])
  trainingStatus?: (typeof TRAINING_STATUSES)[number];
}

export class SaveAgentSkillsDto {
  @ApiProperty({ type: [AgentSkillSelectionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AgentSkillSelectionDto)
  skills: AgentSkillSelectionDto[];
}

export class UpdateAgentBoostDto {
  @ApiProperty({ description: 'Expand service radius from 3 km to 5 km' })
  @IsBoolean()
  enabled: boolean;
}
