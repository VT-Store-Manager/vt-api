import { FileService } from '@module/file/file.service'
import { ProductCategoryAdminService } from '@module/product-category/admin-app/product-category_admin.service'
import { ProductOptionAdminService } from '@module/product-option/admin-app/product-option_admin.service'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Product } from '@schema/product.schema'
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
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

import { CreateProductDTO } from './dto/create-product.dto'
import {
	ProductListPaginationDTO,
	ProductListItemDTO,
} from './dto/response.dto'
import { ProductAdminService } from './product_admin.service'
import { GetProductListQueryDTO } from './dto/get-product-list-query.dto'

@ApiTags('admin-app > product')
@Controller({
	path: 'admin/product',
	version: '1',
})
export class ProductAdminController {
	constructor(
		private readonly productService: ProductAdminService,
		private readonly productCategoryService: ProductCategoryAdminService,
		private readonly productOptionService: ProductOptionAdminService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FilesInterceptor('images', 4, ImageMulterOption(2)))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(Product, 201)
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
		return result
	}

	@Get()
	@ApiSuccessResponse(ProductListItemDTO, 200, true)
	async getProducts() {
		return await this.productService.getAll()
	}

	@Get('list')
	@ApiSuccessResponse(ProductListPaginationDTO)
	async getProductListPagination(@Query() query: GetProductListQueryDTO) {
		return await this.productService.getList(query)
	}
}
