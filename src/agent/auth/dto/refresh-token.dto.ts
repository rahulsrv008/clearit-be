import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token returned by verify-otp' })
  @IsString()
  @MinLength(32)
  refreshToken: string;
}
