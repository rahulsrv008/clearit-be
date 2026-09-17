import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const NOTIFICATION_AUDIENCES = [
  'ALL',
  'CUSTOMERS',
  'AGENTS',
  'SPECIFIC',
];

export class SendAdminNotificationDto {
  @ApiProperty({ enum: NOTIFICATION_AUDIENCES })
  @IsIn(NOTIFICATION_AUDIENCES)
  audience: 'ALL' | 'CUSTOMERS' | 'AGENTS' | 'SPECIFIC';

  @ApiPropertyOptional({
    description: 'users.id list — required when audience is SPECIFIC',
    type: [String],
  })
  @ValidateIf((dto: SendAdminNotificationDto) => dto.audience === 'SPECIFIC')
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1000)
  @IsUUID('all', { each: true })
  userIds?: string[];

  @ApiProperty({ example: 'Monsoon offer' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Flat 20% off on deep cleaning this week.' })
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ example: 'promotion', default: 'general' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;
}
