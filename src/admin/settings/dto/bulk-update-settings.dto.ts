import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AdminSettingEntryDto {
  @ApiProperty({ example: 'agent_incentive_threshold' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  key: string;

  @ApiProperty({ description: 'Stored as JSON', example: 15000 })
  @IsDefined()
  value: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class BulkUpdateAdminSettingsDto {
  @ApiProperty({ type: [AdminSettingEntryDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => AdminSettingEntryDto)
  settings: AdminSettingEntryDto[];
}
