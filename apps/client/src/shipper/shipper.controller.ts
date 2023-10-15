import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ShipperService } from './shipper.service'

@Controller('member/shipper')
@ApiTags('member-app > shipper')
export class ShipperController {
	constructor(private readonly shipperService: ShipperService) {}
}
