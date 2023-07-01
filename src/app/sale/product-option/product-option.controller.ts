import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GetAllProductOptionDTO } from './dto/response.dto'
import { ProductOptionService } from './product-option.service'
import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'

@Controller({
	path: 'sale/product-option',
	version: '1',
})
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
