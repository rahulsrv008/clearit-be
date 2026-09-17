import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { AdminAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AdminServicesService } from './services.service';
import { ListAdminServicesDto } from './dto/list-services.dto';
import { CreateAdminServiceDto } from './dto/create-service.dto';
import { UpdateAdminServiceDto } from './dto/update-service.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.SERVICES)
export class AdminServicesController {
  constructor(private readonly servicesService: AdminServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List services with category and pricing counts' })
  list(@Query() query: ListAdminServicesDto) {
    return this.servicesService.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a service' })
  create(
    @CurrentUser('sub') adminId: string,
    @Body() dto: CreateAdminServiceDto,
  ) {
    return this.servicesService.create(adminId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  update(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminServiceDto,
  ) {
    return this.servicesService.update(adminId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a service, or deactivate it when bookings reference it',
  })
  remove(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.servicesService.remove(adminId, id);
  }
}
