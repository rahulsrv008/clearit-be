import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { MEDIA_REF_MESSAGE, MEDIA_REF_REGEX } from 'src/common/utils/validation';

/** Document kinds the KYC screen can submit. */
export const AGENT_DOCUMENT_TYPES = [
  'AADHAAR',
  'PAN',
  'DRIVING_LICENSE',
  'POLICE_VERIFICATION',
  'PHOTO',
  'PASSBOOK',
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
    description: 'Photo from camera/gallery (data URL) or a hosted image URL',
  })
  @IsString()
  @Matches(MEDIA_REF_REGEX, { message: MEDIA_REF_MESSAGE })
  documentUrl: string;
}
