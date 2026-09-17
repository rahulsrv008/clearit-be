import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const TIME_MESSAGE = 'must be a time in HH:MM or HH:MM:SS format';

export class UpdateAgentAvailabilityDto {
  @ApiProperty({ description: 'true = online and taking jobs' })
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable: boolean;

  @ApiPropertyOptional({
    example: '2026-09-17',
    description: 'Defaults to today',
  })
  @IsOptional()
  @IsDateString()
  availabilityDate?: string;

  @ApiPropertyOptional({ example: '09:00:00' })
  @IsOptional()
  @Matches(TIME_REGEX, { message: `startTime ${TIME_MESSAGE}` })
  startTime?: string;

  @ApiPropertyOptional({ example: '18:00:00' })
  @IsOptional()
  @Matches(TIME_REGEX, { message: `endTime ${TIME_MESSAGE}` })
  endTime?: string;
}
