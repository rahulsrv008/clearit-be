import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { BooleanQuery } from 'src/admin/admin.transforms';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

export const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'OPS',
  'SUPPORT',
  'FINANCE',
] as const;

export class ListAdminsDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @BooleanQuery()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: ADMIN_ROLES })
  @IsOptional()
  @IsIn([...ADMIN_ROLES])
  role?: string;
}

export class CreateAdminDto {
  @ApiProperty({ example: 'ops@clearit.in' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: ADMIN_ROLES, default: 'ADMIN' })
  @IsOptional()
  @IsIn([...ADMIN_ROLES])
  role?: string;
}

export class UpdateAdminDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: ADMIN_ROLES })
  @IsOptional()
  @IsIn([...ADMIN_ROLES])
  role?: string;

  /** Optional password reset from the admin-users screen. */
  @ApiPropertyOptional({ minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
