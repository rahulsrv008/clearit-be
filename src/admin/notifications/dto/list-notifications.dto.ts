import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

/** `search` is inherited from PaginationQueryDto and matches title/message. */
export class ListAdminNotificationsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'promotion' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Recipient users.id' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ example: '2026-09-01', description: 'createdAt from' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-09-30', description: 'createdAt to' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
