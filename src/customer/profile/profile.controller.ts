import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { CustomerAuth } from 'src/common/decorators/authorize.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CustomerProfileService } from './profile.service';
import { UpdateCustomerProfileDto } from './dto/update-profile.dto';

@ApiTags('customer')
@CustomerAuth()
@Controller(ROUTES.CUSTOMER.PROFILE)
export class CustomerProfileController {
  constructor(private readonly profileService: CustomerProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get customer profile' })
  get(@CurrentUser('sub') userId: string) {
    return this.profileService.get(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update customer profile' })
  update(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.profileService.update(userId, dto);
  }
}
