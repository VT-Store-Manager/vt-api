import { CurrentUser, JwtAccess } from '@app/authentication'
import { ApiSuccessResponse, Role } from '@app/common'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ProductCategoryItemDTO } from './dto/response.dto'
import { ProductCategoryService } from './product-category.service'

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
