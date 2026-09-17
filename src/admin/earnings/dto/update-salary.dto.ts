import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { SALARY_STATUSES } from './list-salary.dto';

export class UpdateAdminSalaryDto {
  @ApiPropertyOptional({ enum: SALARY_STATUSES })
  @IsOptional()
  @IsIn(SALARY_STATUSES)
  status?: string;

  @ApiPropertyOptional({ example: 500, description: 'Recomputes netSalary' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  deductions?: number;

  @ApiPropertyOptional({
    description:
      'salary_records has no remarks column, so this is kept in the audit log only',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
