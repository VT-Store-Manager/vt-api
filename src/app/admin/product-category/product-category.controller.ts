import { FileService } from '@module/file/file.service'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { ProductCategory } from '@schema/product-category.schema'
import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

import { CreateProductCategoryDTO } from './dto/create-product-category.dto'
import { ProductCategoryService } from './product-category.service'
import { GetProductCategoryPaginationDTO } from './dto/get-product-category-pagination'
import { ProductCategorySelectDataDTO } from './dto/response.dto'

@ApiTags('admin-app > product-category')
@Controller({
	path: 'admin/product-category',
	version: '1',
})
export class ProductCategoryController {
	constructor(
		private readonly productCategoryService: ProductCategoryService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image', ImageMulterOption(2, 1)))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(ProductCategory, 201)
	async createProductCategory(
		@UploadedFile(ParseFile) image: Express.Multer.File,
		@Body() body: CreateProductCategoryDTO
	) {
		let imageKey = ''
		if (image) {
			imageKey = this.fileService.createObjectKey(
				['product-category'],
				image.originalname
			)
		}
		body.image = imageKey
		let result: ProductCategory
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const createResult = await Promise.all([
					image
						? this.fileService.upload(image.buffer, imageKey, abortController)
						: null,
					this.productCategoryService.create(body, session),
				])

				result = createResult[1]
			}
		)
		if (error) {
			abortController.abort()
			this.fileService.delete([imageKey])
			throw error
		}

		return result
	}

	@Get('list')
	async getProductCategoryList(
		@Query() query: GetProductCategoryPaginationDTO
	) {
		return await this.productCategoryService.getListPagination(query)
	}

	@Get('select-list')
	@ApiSuccessResponse(ProductCategorySelectDataDTO, 200, true)
	async getProductCategorySelectList() {
		return await this.productCategoryService.getSelectList()
	}

	@Patch('delete/:id')
	async deleteProductCategory(@Param('id', ObjectIdPipe) id: string) {
		return await this.productCategoryService.delete(id)
	}
}
