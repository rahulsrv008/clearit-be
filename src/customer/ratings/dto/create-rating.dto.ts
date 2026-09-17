import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCustomerRatingDto {
  @ApiProperty({ description: 'Completed booking to rate' })
  @IsUUID()
  bookingId: string;

  @ApiProperty({ example: 4.5, minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Very thorough and on time' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  review?: string;
}
