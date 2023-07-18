import { ApiSuccessResponse } from '@app/common'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetAllProductOptionDTO } from './dto/response.dto'
import { ProductOptionService } from './product-option.service'

@Controller({
	path: 'member/product-option',
	version: '1',
})
@ApiTags('member-app > product-option')
export class ProductOptionController {
	constructor(private readonly productOptionService: ProductOptionService) {}

	@Get('all')
	@ApiSuccessResponse(GetAllProductOptionDTO, 200, true)
	async getAllProductOption() {
		return await this.productOptionService.getAllProductOptions()
	}
}
