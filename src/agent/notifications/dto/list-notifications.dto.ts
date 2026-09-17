import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export class ListAgentNotificationsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  // Query strings arrive as text, and `Boolean('false')` is true.
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  unreadOnly?: boolean;
}
