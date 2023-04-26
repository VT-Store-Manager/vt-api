import { FileService } from '@/app/file/file.service'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { MongoSessionService } from '@/providers/mongo/session.service'
import { ProductCategory } from '@/schemas/product-category.schema'
import {
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Param,
	Patch,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

import { CreateProductCategoryDTO } from './dto/create-product-category.dto'
import { ProductCategoryAdminService } from './product-category_admin.service'

@ApiTags('admin-app > product-category')
@Controller({
	path: 'admin/product-category',
	version: '1',
})
export class ProductCategoryAdminController {
	constructor(
		private readonly productCategoryService: ProductCategoryAdminService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
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

		let result: ProductCategory
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const createResult = await Promise.all([
					this.fileService.upload(image.buffer, objectKey, abortController),
					this.productCategoryService.create(
						{ ...dto, image: objectKey },
						session
					),
				])

				result = createResult[1]
			}
		)
		if (error) {
			abortController.abort()
			this.fileService.delete([objectKey])
			throw new InternalServerErrorException(error.message)
		}

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
