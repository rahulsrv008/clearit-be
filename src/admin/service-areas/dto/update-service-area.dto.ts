import { PartialType } from '@nestjs/swagger';
import { CreateAdminServiceAreaDto } from './create-service-area.dto';

export class UpdateAdminServiceAreaDto extends PartialType(
  CreateAdminServiceAreaDto,
) {}
