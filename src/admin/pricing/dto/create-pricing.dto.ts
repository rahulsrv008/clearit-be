import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateAdminPricingDto {
  @ApiProperty({ description: 'services.id' })
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({
    description: 'service_areas.id. Omit for the default (all areas) price.',
  })
  @IsOptional()
  @IsUUID()
  serviceAreaId?: string;

  @ApiProperty({ example: 299.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePerHour: number;

  @ApiPropertyOptional({ example: 180.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  agentPayoutPerHour?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
