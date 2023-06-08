import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GetProductCategoryDTO } from './dto/get-product-category.dto'
import { ProductCategoryDTO } from './dto/response.dto'
import { ProductCategoryService } from './product-category.service'

@Controller({
	path: 'member/product-category',
	version: '1',
})
@ApiTags('member-app > product-category')
export class ProductCategoryController {
	constructor(
		private readonly productCategoryService: ProductCategoryService
	) {}

	@Get()
	@ApiSuccessResponse(ProductCategoryDTO, 200, true)
	async getAllCategories(@Query() query: GetProductCategoryDTO) {
		return await this.productCategoryService.getCategoriesWithProducts(
			query.storeId
		)
	}
}
