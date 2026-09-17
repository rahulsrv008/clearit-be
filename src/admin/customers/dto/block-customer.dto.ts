import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class BlockAdminCustomerDto {
  @ApiPropertyOptional({
    description: 'Shown to the customer in the block notification',
    example: 'Repeated payment chargebacks',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
