import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { BooleanQuery } from 'src/admin/admin.transforms';

/** `search` is inherited from PaginationQueryDto and matches the category name. */
export class ListAdminServiceCategoriesDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @BooleanQuery()
  @IsBoolean()
  isActive?: boolean;
}
