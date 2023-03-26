import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { MongoService } from '@/common/providers/mongo.service'
import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateProductOptionDto } from './dto/create-product-option.dto'
import { NewProductOptionDto } from './dto/new-product-option.dto'
import { ProductOptionDetailDto } from './dto/product-option-detail.dto'
import { ProductOptionListItemDto } from './dto/product-option-list-item.dto'
import { ProductOptionService } from './product-option.service'

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
	@ApiSuccessResponse(NewProductOptionDto, 201)
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

	@Get(':id/detail')
	@ApiSuccessResponse(ProductOptionDetailDto, 200)
	async getProductOptionDetail(
		@Param('id', ObjectIdPipe) id: string
	): Promise<ProductOptionDetailDto> {
		const [optionDetail, applyingProducts, boughtAmount] = await Promise.all([
			this.productOptionService.getDetail(id),
			this.productOptionService.getApplyingProduct(id),
			0,
		])
		return {
			...optionDetail,
			applyingProducts,
			boughtAmount,
		}
	}
}
