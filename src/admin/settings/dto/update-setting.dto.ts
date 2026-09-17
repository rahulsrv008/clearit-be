import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminSettingDto {
  @ApiProperty({
    description: 'Stored as JSON, so a number, string, boolean or object',
    example: 15000,
  })
  @IsDefined()
  value: unknown;

  @ApiPropertyOptional({ example: 'Monthly revenue an agent must cross' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
