import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class RemoveCustomerDeviceTokenDto {
  @ApiProperty({ description: 'FCM registration token to deactivate' })
  @IsString()
  @MaxLength(500)
  token: string;
}
