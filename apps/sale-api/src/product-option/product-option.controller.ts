import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, Role } from '@app/common'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { GetAllProductOptionDTO } from './dto/response.dto'
import { ProductOptionService } from './product-option.service'

@Controller('sale/product-option')
@ApiTags('sale-app > product-option')
export class ProductOptionController {
	constructor(private readonly productOptionService: ProductOptionService) {}

	@Get()
	@JwtAccess(Role.SALESPERSON)
	@ApiSuccessResponse(GetAllProductOptionDTO, 200, true)
	async getAllProductOption(@CurrentUser('sub') storeId: string) {
		return await this.productOptionService.getAllProductOptions(storeId)
	}
}
