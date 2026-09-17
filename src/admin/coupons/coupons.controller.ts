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
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { AdminCouponsService } from './coupons.service';
import { ListAdminCouponsDto } from './dto/list-coupons.dto';
import { CreateAdminCouponDto } from './dto/create-coupon.dto';
import { UpdateAdminCouponDto } from './dto/update-coupon.dto';

@ApiTags('admin')
@AdminAuth()
@Controller(ROUTES.ADMIN.COUPONS)
export class AdminCouponsController {
  constructor(private readonly couponsService: AdminCouponsService) {}

  @Get()
  @ApiOperation({ summary: 'List coupons with usage counts' })
  list(@Query() query: ListAdminCouponsDto) {
    return this.couponsService.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a coupon' })
  create(
    @CurrentUser('sub') adminId: string,
    @Body() dto: CreateAdminCouponDto,
  ) {
    return this.couponsService.create(adminId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a coupon' })
  update(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminCouponDto,
  ) {
    return this.couponsService.update(adminId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an unused coupon, or deactivate a redeemed one',
  })
  remove(
    @CurrentUser('sub') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.couponsService.remove(adminId, id);
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Redemptions of one coupon' })
  usage(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.couponsService.usage(id, query);
  }
}
