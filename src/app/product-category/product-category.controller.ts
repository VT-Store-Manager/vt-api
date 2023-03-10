import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { MongoService } from '@/common/providers/mongo.service'
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

import { FileService } from '../file/file.service'
import { CreateProductCategoryDto } from './dto/create-product-category.dto'
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
	@UseInterceptors(FileInterceptor('image'))
	@ApiConsumes('multipart/form-data')
	async createProductCategory(
		@UploadedFile() image: Express.Multer.File,
		@Body() dto: CreateProductCategoryDto
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

					return createResult[1][0]
				},

				errorCb: async _err => {
					if (this.fileService.checkFile(objectKey))
						this.fileService.delete([objectKey])
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
