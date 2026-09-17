import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterDeviceTokenDto {
  @ApiProperty({ description: 'FCM registration token' })
  @IsString()
  @MaxLength(512)
  token: string;

  @ApiPropertyOptional({ enum: ['android', 'ios', 'web'] })
  @IsOptional()
  @IsIn(['android', 'ios', 'web'])
  platform?: string;
}

export class RemoveDeviceTokenDto {
  @ApiProperty({ description: 'FCM registration token to deactivate' })
  @IsString()
  @MaxLength(512)
  token: string;
}
