import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, Length, Matches } from 'class-validator';
import { MOBILE_MESSAGE, MOBILE_REGEX } from 'src/common/utils/validation';

export class VerifyOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(MOBILE_REGEX, { message: MOBILE_MESSAGE })
  mobile: string;

  @ApiProperty({ example: '1111', description: 'OTP received over SMS' })
  @IsNumberString()
  @Length(4, 6)
  otp: string;
}
