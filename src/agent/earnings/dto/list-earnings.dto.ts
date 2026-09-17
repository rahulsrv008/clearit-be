import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export class ListAgentEarningsDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'Inclusive earning date',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-09-30',
    description: 'Inclusive earning date',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
