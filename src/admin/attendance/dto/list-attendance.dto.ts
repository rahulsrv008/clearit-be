import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

/** `search` matches the agent's name. */
export class ListAdminAttendanceDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'agents.id' })
  @IsOptional()
  @IsUUID()
  agentId?: string;

  @ApiPropertyOptional({
    enum: ['PRESENT', 'CHECKED_IN', 'CHECKED_OUT', 'ABSENT'],
    description: 'agent_attendance.status as written by the Agent app',
  })
  @IsOptional()
  @IsIn(['PRESENT', 'CHECKED_IN', 'CHECKED_OUT', 'ABSENT'])
  status?: string;

  @ApiPropertyOptional({ example: '2026-09-01', description: 'attendanceDate from' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-09-30', description: 'attendanceDate to' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
