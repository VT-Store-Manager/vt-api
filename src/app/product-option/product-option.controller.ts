import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateProductOptionDto } from './dto/create-product-option.dto'
import { ProductOptionListItemDto } from './dto/product-option-list-item.dto'
import { ProductOptionService } from './product-option.service'
import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { MongoService } from '@/common/providers/mongo.service'
import { NewProductOptionDto } from './dto/new-product-option.dto'

@ApiTags('product-option')
@Controller({
	path: 'product-option',
	version: '1',
})
export class ProductOptionController {
	constructor(
		private readonly productOptionService: ProductOptionService,
		private readonly mongoService: MongoService
	) {}

	@Get('list')
	@ApiSuccessResponse(ProductOptionListItemDto, 200, true)
	async getProductOptionList(): Promise<ProductOptionListItemDto[]> {
		return this.productOptionService.getList()
	}

	@Post('create')
	async createProductOption(@Body() body: CreateProductOptionDto) {
		const { result, err } =
			await this.mongoService.transaction<NewProductOptionDto>({
				transactionCb: async session => {
					const newProductOption = await this.productOptionService.create(
						body,
						session
					)
					return newProductOption
				},
			})
		if (err) throw err
		return result
	}
}
