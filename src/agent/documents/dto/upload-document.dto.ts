import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

/** Document kinds the KYC screen can submit. */
export const AGENT_DOCUMENT_TYPES = [
  'AADHAAR',
  'PAN',
  'DRIVING_LICENSE',
  'POLICE_VERIFICATION',
  'PHOTO',
] as const;

export class UploadAgentDocumentDto {
  @ApiProperty({ enum: AGENT_DOCUMENT_TYPES })
  @IsIn([...AGENT_DOCUMENT_TYPES])
  documentType: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentNumber?: string;

  @ApiProperty({
    description: 'Public URL the mobile app uploaded the scan to',
  })
  @IsUrl()
  documentUrl: string;
}
