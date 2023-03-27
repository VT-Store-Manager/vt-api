import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { MongoService } from '@/providers/mongo.service'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { Product } from '@/schemas/product.schema'
import {
	Body,
	Controller,
	Get,
	Post,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

import { FileService } from '../file/file.service'
import { ProductCategoryService } from '../product-category/product-category.service'
import { ProductOptionService } from '../product-option/product-option.service'
import { CreateProductDto } from './dto/create-product.dto'
import { ResponseProductItemDto } from './dto/response-products.dto'
import { ProductService } from './product.service'

@ApiTags('product')
@Controller({
	path: 'product',
	version: '1',
})
export class ProductController {
	constructor(
		private readonly productService: ProductService,
		private readonly productCategoryService: ProductCategoryService,
		private readonly productOptionService: ProductOptionService,
		private readonly fileService: FileService,
		private readonly mongoService: MongoService
	) {}

	@Post('create')
	@UseInterceptors(FilesInterceptor('images', 4, ImageMulterOption(2)))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(Product, 201)
	async createProduct(
		@UploadedFiles(ParseFile) images: Express.Multer.File[],
		@Body() dto: CreateProductDto
	) {
		const objectKeys = images.map(image =>
			this.fileService.createObjectKey(['product'], image.originalname)
		)
		const { result, err } = await this.mongoService.transaction<Product>({
			transactionCb: async session => {
				const createResult = await Promise.all([
					this.fileService.uploadMulti(images, objectKeys),
					this.productService.create({ ...dto, images: objectKeys }, session),
				])
				return createResult[1]
			},
			errorCb: async _err => {
				const existedKeys = await objectKeys.filter(
					async key => await this.fileService.checkFile(key)
				)
				await this.fileService.delete(existedKeys)
			},
		})
		if (err) throw err
		return result
	}

	@Get()
	@ApiSuccessResponse(ResponseProductItemDto, 200, true)
	async getProducts() {
		return await this.productService.getAll()
	}
}
