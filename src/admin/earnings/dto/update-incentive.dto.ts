import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminIncentiveDto {
  @ApiProperty({ enum: ['APPROVED', 'PAID', 'REJECTED'] })
  @IsIn(['APPROVED', 'PAID', 'REJECTED'])
  status: 'APPROVED' | 'PAID' | 'REJECTED';

  @ApiPropertyOptional({
    description:
      'agent_incentives has no remarks column, so this is kept in the audit log only',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
