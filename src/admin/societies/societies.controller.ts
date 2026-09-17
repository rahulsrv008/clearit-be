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
import { AdminSocietiesService } from './societies.service';
import { ListAdminSocietiesDto } from './dto/list-societies.dto';
import { CreateAdminSocietyDto } from './dto/create-society.dto';
import { UpdateAdminSocietyDto } from './dto/update-society.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.SOCIETIES)
export class AdminSocietiesController {
  constructor(private readonly societiesService: AdminSocietiesService) {}

  @Get()
  @ApiOperation({ summary: 'List societies' })
  list(@Query() query: ListAdminSocietiesDto) {
    return this.societiesService.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a society' })
  create(
    @CurrentUser('sub') adminId: string,
    @Body() dto: CreateAdminSocietyDto,
  ) {
    return this.societiesService.create(adminId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a society' })
  update(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminSocietyDto,
  ) {
    return this.societiesService.update(adminId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a society' })
  remove(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.societiesService.remove(adminId, id);
  }
}
