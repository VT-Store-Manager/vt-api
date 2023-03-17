import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { MongoService } from '@/common/providers/mongo.service'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { Product } from '@/schemas/product.schema'
import {
	Body,
	Controller,
	Post,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'

import { FileService } from '../file/file.service'
import { ProductCategoryService } from '../product-category/product-category.service'
import { ProductOptionService } from '../product-option/product-option.service'
import { CreateProductDto } from './dto/create-product.dto'
import { ProductService } from './product.service'

@Controller({
	path: 'product',
	version: '1',
})
@ApiTags('product')
export class ProductController {
	constructor(
		private readonly productService: ProductService,
		private readonly productCategoryService: ProductCategoryService,
		private readonly productOptionService: ProductOptionService,
		private readonly fileService: FileService,
		private readonly mongoService: MongoService
	) {}

	@Post('create')
	@UseInterceptors(FilesInterceptor('images', 2, ImageMulterOption(2)))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(Product, 201)
	async createProduct(
		@UploadedFiles() images: Express.Multer.File[],
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
				console.log('Alo alo')
				const existedKeys = await objectKeys.filter(
					async key => await this.fileService.checkFile(key)
				)
				await this.fileService.delete(existedKeys)
				console.log('Delete images sucessful')
			},
		})
		if (err) throw err
		return result
	}
}
