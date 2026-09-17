import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { BooleanQuery } from 'src/admin/admin.transforms';

/** `search` is inherited from PaginationQueryDto and matches name/mobile/email. */
export class ListAdminCustomersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter on the linked user account' })
  @IsOptional()
  @BooleanQuery()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-09-01', description: 'createdAt from' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-09-30', description: 'createdAt to' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
