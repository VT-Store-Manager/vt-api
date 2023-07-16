import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { RemoveNullishObjectPipe } from '@/common/pipes/object.pipe'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CreateProductOptionDTO } from './dto/create-product-option.dto'
import { NewProductOptionDTO } from './dto/new-product-option.dto'
import { ProductOptionDetailDTO } from './dto/product-option-detail.dto'
import { ProductOptionListPagination } from './dto/product-option-list-item.dto'
import { UpdateProductOptionDTO } from './dto/update-product-option.dto'
import { ProductOptionService } from './product-option.service'
import { ProductOptionSelectDTO } from './dto/response.dto'
import { GetOptionListQueryDTO } from './dto/get-option-list-query.dto'

@ApiTags('admin-app > product-option')
@Controller({
	path: 'admin/product-option',
	version: '1',
})
export class ProductOptionController {
	constructor(
		private readonly productOptionService: ProductOptionService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Get('list')
	@ApiSuccessResponse(ProductOptionListPagination)
	async getProductOptionList(
		@Query() query: GetOptionListQueryDTO
	): Promise<ProductOptionListPagination> {
		return await this.productOptionService.getList(query)
	}

	@Get('select-list')
	@ApiSuccessResponse(ProductOptionSelectDTO, 200, true)
	async getProductOptionSelectList() {
		return this.productOptionService.getSelectList()
	}

	@Post('create')
	@ApiSuccessResponse(NewProductOptionDTO, 201)
	async createProductOption(@Body() body: CreateProductOptionDTO) {
		let result: NewProductOptionDTO
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const newProductOption = await this.productOptionService.create(
					body,
					session
				)
				result = newProductOption
			}
		)
		if (error) throw error

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
		@Body(RemoveNullishObjectPipe) dto: UpdateProductOptionDTO
	) {
		const updateResult = await this.productOptionService.update(id, dto)
		return updateResult.modifiedCount === 1
	}
}
