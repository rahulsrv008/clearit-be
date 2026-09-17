import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class VerifyAdminAgentDocumentDto {
  @ApiProperty({ enum: ['VERIFIED', 'REJECTED'] })
  @IsIn(['VERIFIED', 'REJECTED'])
  verificationStatus: 'VERIFIED' | 'REJECTED';

  @ApiPropertyOptional({
    description: 'Reason shown to the agent when the document is rejected',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}
