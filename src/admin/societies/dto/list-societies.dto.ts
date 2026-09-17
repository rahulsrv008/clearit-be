import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { BooleanQuery } from 'src/admin/admin.transforms';

/** `search` is inherited from PaginationQueryDto: name, city or pincode. */
export class ListAdminSocietiesDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @BooleanQuery()
  @IsBoolean()
  isActive?: boolean;
}
