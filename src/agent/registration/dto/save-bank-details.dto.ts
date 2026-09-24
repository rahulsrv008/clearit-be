import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class SaveAgentBankDetailsDto {
  @ApiProperty({ example: 'Rahul Srivastav' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  accountHolderName: string;

  @ApiProperty({ example: '50100123456789' })
  @Transform(trim)
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  accountNumber: string;

  @ApiProperty({ example: 'HDFC0001234' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s+/g, '').toUpperCase() : value,
  )
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  ifscCode: string;

  @ApiProperty({ example: 'HDFC Bank' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  bankName: string;
}
