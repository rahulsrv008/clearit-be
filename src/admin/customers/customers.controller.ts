import {
  Body,
  Controller,
  Get,
  HttpCode,
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
import { AdminCustomersService } from './customers.service';
import { ListAdminCustomersDto } from './dto/list-customers.dto';
import { UpdateAdminCustomerDto } from './dto/update-customer.dto';
import { BlockAdminCustomerDto } from './dto/block-customer.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.CUSTOMERS)
export class AdminCustomersController {
  constructor(private readonly customersService: AdminCustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers with booking counts' })
  list(@Query() query: ListAdminCustomersDto) {
    return this.customersService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Customer profile, addresses, spend and bookings' })
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.detail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer profile fields' })
  update(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminCustomerDto,
  ) {
    return this.customersService.update(adminId, id, dto);
  }

  @Post(':id/block')
  @HttpCode(200)
  @ApiOperation({ summary: 'Block a customer account' })
  block(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BlockAdminCustomerDto,
  ) {
    return this.customersService.block(adminId, id, dto);
  }

  @Post(':id/unblock')
  @HttpCode(200)
  @ApiOperation({ summary: 'Restore a blocked customer account' })
  unblock(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.customersService.unblock(adminId, id);
  }
}
