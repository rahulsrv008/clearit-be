import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IFSC_REGEX } from 'src/common/utils/validation';

export class SaveAgentBankDetailsDto {
  @ApiProperty({ example: 'Rahul Srivastav' })
  @IsString()
  @MaxLength(150)
  accountHolderName: string;

  @ApiProperty({ example: '50100123456789' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  accountNumber: string;

  @ApiProperty({ example: 'HDFC0001234' })
  @IsString()
  @Matches(IFSC_REGEX, { message: 'ifscCode must be a valid IFSC code' })
  ifscCode: string;

  @ApiProperty({ example: 'HDFC Bank' })
  @IsString()
  @MaxLength(150)
  bankName: string;
}
