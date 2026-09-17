import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { BooleanQuery } from 'src/admin/admin.transforms';

/** `search` is inherited from PaginationQueryDto and matches the service name. */
export class ListAdminServicesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by service category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @BooleanQuery()
  @IsBoolean()
  isActive?: boolean;
}
