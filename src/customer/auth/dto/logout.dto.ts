import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    description:
      'Refresh token to revoke. Omit to sign out of every device for this account.',
  })
  @IsOptional()
  @IsString()
  @MinLength(32)
  refreshToken?: string;
}
