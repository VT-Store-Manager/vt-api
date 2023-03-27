import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { MongoService } from '@/providers/mongo.service'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { ProductCategory } from '@/schemas/product-category.schema'
import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

import { ParseFile } from '../../common/pipes/parse-file.pipe'
import { FileService } from '../file/file.service'
import { CreateProductCategoryDTO } from './dto/create-product-category.dto'
import { ProductCategoryService } from './product-category.service'

@ApiTags('product-category')
@Controller({
	path: 'product-category',
	version: '1',
})
export class ProductCategoryController {
	constructor(
		private readonly productCategoryService: ProductCategoryService,
		private readonly fileService: FileService,
		private readonly mongoService: MongoService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image', ImageMulterOption(2, 1)))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(ProductCategory, 201)
	async createProductCategory(
		@UploadedFile(ParseFile) image: Express.Multer.File,
		@Body() dto: CreateProductCategoryDTO
	) {
		const objectKey = this.fileService.createObjectKey(
			['product-category'],
			image.originalname
		)

		const { result, err } =
			await this.mongoService.transaction<ProductCategory>({
				transactionCb: async session => {
					const createResult = await Promise.all([
						this.fileService.upload(image.buffer, objectKey),
						this.productCategoryService.create(
							{ ...dto, image: objectKey },
							session
						),
					])

					return createResult[1]
				},

				errorCb: async _err => {
					if (this.fileService.checkFile(objectKey))
						await this.fileService.delete([objectKey])
				},
			})
		if (err) throw err
		return result
	}

	@Get('list')
	async getProductCategory() {
		return await this.productCategoryService.list()
	}

	@Patch('delete/:id')
	async deleteProductCategory(@Param('id', ObjectIdPipe) id: string) {
		return await this.productCategoryService.delete(id)
	}
}
