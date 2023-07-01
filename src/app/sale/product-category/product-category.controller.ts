import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Controller, Get } from '@nestjs/common'

import { ProductCategoryItemDTO } from './dto/response.dto'
import { ProductCategoryService } from './product-category.service'
import { ApiTags } from '@nestjs/swagger'

@Controller({
	path: 'sale/category',
	version: '1',
})
@ApiTags('sale-app > category')
export class ProductCategoryController {
	constructor(
		private readonly productCategoryService: ProductCategoryService
	) {}

	@Get()
	@JwtAccess(Role.SALESPERSON)
	@ApiSuccessResponse(ProductCategoryItemDTO, 200, true)
	async getStoreCategories(@CurrentUser('sub') storeId: string) {
		return await this.productCategoryService.getCategoriesWithProducts(storeId)
	}
}
