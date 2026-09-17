import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateAdminPricingDto {
  @ApiPropertyOptional({ description: 'services.id' })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({ description: 'service_areas.id' })
  @IsOptional()
  @IsUUID()
  serviceAreaId?: string;

  @ApiPropertyOptional({ example: 299.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePerHour?: number;

  @ApiPropertyOptional({ example: 180.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  agentPayoutPerHour?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
