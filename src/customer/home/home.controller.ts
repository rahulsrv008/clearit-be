import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES } from 'src/app.routes';
import { CustomerHomeService } from './home.service';

/** Public: the home layout is shown before sign-in completes and holds no personal data. */
@ApiTags('customer')
@Controller(ROUTES.CUSTOMER.HOME)
export class CustomerHomeController {
  constructor(private readonly homeService: CustomerHomeService) {}

  @Get()
  @ApiOperation({
    summary: 'Home screen content: category tiles, their options, most popular',
  })
  home() {
    return this.homeService.home();
  }
}
