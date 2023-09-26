import {
	ApiSuccessResponse,
	FileService,
	ImageMulterOption,
	ObjectIdPipe,
	ParseFile,
} from '@app/common'
import { MongoSessionService, ProductCategory } from '@app/database'
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
import { GetProductCategoryPaginationDTO } from './dto/get-product-category-pagination'
import {
	ProductCategoryDetailDTO,
	ProductCategorySelectDataDTO,
} from './dto/response.dto'
import { ProductCategoryService } from './product-category.service'

@ApiTags('admin-app > product-category')
@Controller('admin/product-category')
export class ProductCategoryController {
	constructor(
		private readonly productCategoryService: ProductCategoryService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image'))
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

	@Get('detail')
	@ApiSuccessResponse(ProductCategoryDetailDTO)
	async getCategoryDetail(@Query('id', ObjectIdPipe) categoryId: string) {
		return await this.productCategoryService.getDetail(categoryId)
	}
}
