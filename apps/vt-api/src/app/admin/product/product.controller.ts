import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { BooleanResponseDTO } from '@/types/swagger'
import { FileService } from '@module/file/file.service'
import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Product } from '@schema/product.schema'

import { ProductCategoryService } from '../product-category/product-category.service'
import { ProductOptionService } from '../product-option/product-option.service'
import { CreateProductDTO } from './dto/create-product.dto'
import { GetProductListQueryDTO } from './dto/get-product-list-query.dto'
import { ProductListPaginationDTO } from './dto/response-products.dto'
import { ProductService } from './product.service'

@ApiTags('admin-app > product')
@Controller({
	path: 'admin/product',
	version: '1',
})
export class ProductController {
	constructor(
		private readonly productService: ProductService,
		private readonly productCategoryService: ProductCategoryService,
		private readonly productOptionService: ProductOptionService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FilesInterceptor('images', 4, ImageMulterOption(2)))
	@ApiConsumes('multipart/form-data')
	// @ApiSuccessResponse(Product, 201)
	@ApiResponse({ type: BooleanResponseDTO })
	async createProduct(
		@UploadedFiles(ParseFile) images: Express.Multer.File[],
		@Body() dto: CreateProductDTO
	) {
		const objectKeys = images.map(image =>
			this.fileService.createObjectKey(['product'], image.originalname)
		)
		let result: Product
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const createResult = await Promise.all([
					this.fileService.uploadMulti(images, objectKeys, abortController),
					this.productService.create({ ...dto, images: objectKeys }, session),
				])
				result = createResult[1]
			}
		)
		if (error) {
			abortController.abort()
			this.fileService.delete(objectKeys)
			throw error
		}
		return !!result
	}

	@Get('list')
	@ApiSuccessResponse(ProductListPaginationDTO)
	async getProductListPagination(@Query() query: GetProductListQueryDTO) {
		return await this.productService.getList(query)
	}
}
