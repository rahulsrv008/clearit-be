import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export const INCENTIVE_STATUSES = ['PENDING', 'APPROVED', 'PAID', 'REJECTED'];

export class ListAdminIncentivesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'agents.id' })
  @IsOptional()
  @IsUUID()
  agentId?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ minimum: 2020, maximum: 2100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ enum: INCENTIVE_STATUSES })
  @IsOptional()
  @IsIn(INCENTIVE_STATUSES)
  status?: string;
}
