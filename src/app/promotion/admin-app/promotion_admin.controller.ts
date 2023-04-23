import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { PromotionAdminService } from './promotion_admin.service'

@Controller({
	path: 'admin/promotion',
	version: '1',
})
@ApiTags('admin-app > promotion')
export class PromotionAdminController {
	constructor(private readonly promotionAdminService: PromotionAdminService) {}
}
