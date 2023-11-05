import {
	ApiSuccessResponse,
	FileService,
	ObjectIdPipe,
	ParseFile,
} from '@app/common'
import { MongoSessionService, Product } from '@app/database'
import { BooleanResponseDTO } from '@app/types'
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

import { JwtAccess } from '../../authentication/decorators/jwt.decorator'
import { ProductCategoryService } from '../product-category/product-category.service'
import { ProductOptionService } from '../product-option/product-option.service'
import { CreateProductDTO } from './dto/create-product.dto'
import { GetProductListQueryDTO } from './dto/get-product-list-query.dto'
import { ProductListPaginationDTO } from './dto/response-products.dto'
import { ProductDetailDataDTO } from './dto/response.dto'
import { ProductService } from './product.service'

@ApiTags('admin-app > product')
@Controller('admin/product')
@JwtAccess()
export class ProductController {
	constructor(
		private readonly productService: ProductService,
		private readonly productCategoryService: ProductCategoryService,
		private readonly productOptionService: ProductOptionService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FilesInterceptor('images', 4))
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
	@JwtAccess()
	@ApiSuccessResponse(ProductListPaginationDTO)
	async getProductListPagination(@Query() query: GetProductListQueryDTO) {
		return await this.productService.getList(query)
	}

	@Get('detail')
	@ApiSuccessResponse(ProductDetailDataDTO)
	async getProductDetail(@Query('id', ObjectIdPipe) productId: string) {
		return await this.productService.getProductDetailData(productId)
	}
}
