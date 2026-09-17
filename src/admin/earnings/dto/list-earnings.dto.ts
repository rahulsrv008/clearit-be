import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export class ListAdminEarningsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'agents.id' })
  @IsOptional()
  @IsUUID()
  agentId?: string;

  @ApiPropertyOptional({
    example: '2026-09-01',
    description: 'earningDate from',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-09-30', description: 'earningDate to' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
