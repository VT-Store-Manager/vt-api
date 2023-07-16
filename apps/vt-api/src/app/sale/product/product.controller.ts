import { CurrentUser, JwtAccess } from '@app/authentication'
import { Role } from '@app/common'
import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { ProductService } from './product.service'

@Controller({
	path: 'sale/product',
	version: '1',
})
@ApiTags('sale-app > product')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Get(':categoryId')
	@JwtAccess(Role.SALESPERSON)
	async getProductByCategory(
		@Param('categoryId') categoryId: string,
		@CurrentUser('sub') storeId: string
	) {
		return await this.productService.getProductByCategory(storeId, categoryId)
	}
}
