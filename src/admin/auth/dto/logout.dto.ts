import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AdminLogoutDto {
  @ApiPropertyOptional({
    description:
      'Refresh token to revoke. Omit to sign out of every browser for this admin.',
  })
  @IsOptional()
  @IsString()
  @MinLength(32)
  refreshToken?: string;
}
