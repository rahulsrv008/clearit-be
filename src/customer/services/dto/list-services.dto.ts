import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export class ListCustomerServicesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by service category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Area used to pick the price; falls back to the global price',
  })
  @IsOptional()
  @IsUUID()
  serviceAreaId?: string;
}
