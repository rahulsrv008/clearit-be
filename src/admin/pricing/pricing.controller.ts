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
import { AdminPricingService } from './pricing.service';
import { ListAdminPricingDto } from './dto/list-pricing.dto';
import { CreateAdminPricingDto } from './dto/create-pricing.dto';
import { UpdateAdminPricingDto } from './dto/update-pricing.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.PRICING)
export class AdminPricingController {
  constructor(private readonly pricingService: AdminPricingService) {}

  @Get()
  @ApiOperation({ summary: 'List service prices with service and area names' })
  list(@Query() query: ListAdminPricingDto) {
    return this.pricingService.list(query);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a price for a service (optionally by area)',
  })
  create(
    @CurrentUser('sub') adminId: string,
    @Body() dto: CreateAdminPricingDto,
  ) {
    return this.pricingService.create(adminId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a price row' })
  update(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminPricingDto,
  ) {
    return this.pricingService.update(adminId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a price row (never hard deleted)' })
  remove(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.pricingService.deactivate(adminId, id);
  }
}
