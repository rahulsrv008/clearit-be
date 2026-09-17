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
import { AdminServiceCategoriesService } from './service-categories.service';
import { ListAdminServiceCategoriesDto } from './dto/list-service-categories.dto';
import { CreateAdminServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateAdminServiceCategoryDto } from './dto/update-service-category.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.SERVICE_CATEGORIES)
export class AdminServiceCategoriesController {
  constructor(
    private readonly categoriesService: AdminServiceCategoriesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List service categories with service counts' })
  list(@Query() query: ListAdminServiceCategoriesDto) {
    return this.categoriesService.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a service category' })
  create(
    @CurrentUser('sub') adminId: string,
    @Body() dto: CreateAdminServiceCategoryDto,
  ) {
    return this.categoriesService.create(adminId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service category' })
  update(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminServiceCategoryDto,
  ) {
    return this.categoriesService.update(adminId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a category, or deactivate it when it still has services',
  })
  remove(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.remove(adminId, id);
  }
}
