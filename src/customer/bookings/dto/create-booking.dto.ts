import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** 'YYYY-MM-DD' */
export const BOOKING_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** 'HH:MM' or 'HH:MM:SS' on a 24-hour clock. */
export const BOOKING_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class CreateCustomerBookingItemDto {
  @ApiProperty({ description: 'Active service to book' })
  @IsUUID()
  serviceId: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Overrides the service default duration',
    minimum: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(1440)
  durationMinutes?: number;
}

export class CreateCustomerBookingDto {
  @ApiProperty({ description: 'One of the customer own addresses' })
  @IsUUID()
  addressId: string;

  @ApiProperty({ example: '2026-09-20' })
  @Matches(BOOKING_DATE_REGEX, { message: 'bookingDate must be YYYY-MM-DD' })
  bookingDate: string;

  @ApiProperty({ example: '10:30' })
  @Matches(BOOKING_TIME_REGEX, {
    message: 'startTime must be HH:MM or HH:MM:SS',
  })
  startTime: string;

  @ApiProperty({ type: [CreateCustomerBookingItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerBookingItemDto)
  items: CreateCustomerBookingItemDto[];

  @ApiPropertyOptional({ example: 'CLEAN100' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  couponCode?: string;

  @ApiPropertyOptional({ example: 'Ring the bell twice' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
