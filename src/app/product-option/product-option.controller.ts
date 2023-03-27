import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { clearUndefineOrNullField } from '@/common/helpers/body.helper'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { MongoService } from '@/providers/mongo.service'
import {
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Param,
	Patch,
	Post,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateProductOptionDTO } from './dto/create-product-option.dto'
import { NewProductOptionDTO } from './dto/new-product-option.dto'
import { ProductOptionDetailDTO } from './dto/product-option-detail.dto'
import { ProductOptionListItemDTO } from './dto/product-option-list-item.dto'
import { UpdateProductOptionDTO } from './dto/update-product-option.dto'
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
	@ApiSuccessResponse(ProductOptionListItemDTO, 200, true)
	async getProductOptionList(): Promise<ProductOptionListItemDTO[]> {
		return this.productOptionService.getList()
	}

	@Post('create')
	@ApiSuccessResponse(NewProductOptionDTO, 201)
	async createProductOption(@Body() body: CreateProductOptionDTO) {
		let result: NewProductOptionDTO
		const { error } = await this.mongoService.execTransaction(async session => {
			const newProductOption = await this.productOptionService.create(
				body,
				session
			)
			result = newProductOption
		})
		if (error) throw new InternalServerErrorException()

		return result
	}

	@Get(':id/detail')
	@ApiSuccessResponse(ProductOptionDetailDTO)
	async getProductOptionDetail(
		@Param('id', ObjectIdPipe) id: string
	): Promise<ProductOptionDetailDTO> {
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

	@Patch(':id/update')
	async updateProductOption(
		@Param('id', ObjectIdPipe) id: string,
		@Body() dto: UpdateProductOptionDTO
	) {
		clearUndefineOrNullField(dto)
		const updateResult = await this.productOptionService.update(id, dto)
		return updateResult.modifiedCount === 1
	}
}
