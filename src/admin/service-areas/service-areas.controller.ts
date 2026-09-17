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
import { AdminServiceAreasService } from './service-areas.service';
import { ListAdminServiceAreasDto } from './dto/list-service-areas.dto';
import { CreateAdminServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateAdminServiceAreaDto } from './dto/update-service-area.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.SERVICE_AREAS)
export class AdminServiceAreasController {
  constructor(private readonly serviceAreasService: AdminServiceAreasService) {}

  @Get()
  @ApiOperation({ summary: 'List service areas' })
  list(@Query() query: ListAdminServiceAreasDto) {
    return this.serviceAreasService.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a service area' })
  create(
    @CurrentUser('sub') adminId: string,
    @Body() dto: CreateAdminServiceAreaDto,
  ) {
    return this.serviceAreasService.create(adminId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service area' })
  update(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminServiceAreaDto,
  ) {
    return this.serviceAreasService.update(adminId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a service area, or deactivate it when it is referenced',
  })
  remove(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.serviceAreasService.remove(adminId, id);
  }
}
