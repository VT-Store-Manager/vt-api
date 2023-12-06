import {
	ApiSuccessResponse,
	FileService,
	ImageMulterOption,
	ObjectIdPipe,
	ParseFile,
} from '@app/common'
import { MongoSessionService, Store } from '@app/database'
import {
	BadRequestException,
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

import { ProductCategoryService } from '../product-category/product-category.service'
import { ProductOptionService } from '../product-option/product-option.service'
import { ProductService } from '../product/product.service'
import { CreateStoreDTO } from './dto/create-store.dto'
import { GetListStoreDTO } from './dto/get-list-store.dto'
import { ResponseStoreListDTO } from './dto/response-store-item.dto'
import { StoreService } from './store.service'
import { ResponseStoreDetailDTO } from './dto/response-store-detail.dto'

@ApiTags('admin-app > store')
@Controller('admin/store')
export class StoreController {
	constructor(
		private readonly storeService: StoreService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService,
		private readonly productService: ProductService,
		private readonly productCategoryService: ProductCategoryService,
		private readonly productOptionService: ProductOptionService
	) {}

	@Post('create')
	@UseInterceptors(
		FilesInterceptor('images', undefined, ImageMulterOption(2, 6))
	)
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(Store, 201)
	async createStore(
		@UploadedFiles(ParseFile) images: Express.Multer.File[],
		@Body() createDTO: CreateStoreDTO
	) {
		const notFoundList = await Promise.all([
			this.productService.isExist(...createDTO.unavailableGoods.product),
			this.productCategoryService.isExist(
				...createDTO.unavailableGoods.category
			),
			this.productOptionService.isExist(...createDTO.unavailableGoods.option),
		])
		if (notFoundList[0].length > 0) {
			throw new BadRequestException(
				`Product with id ${notFoundList[0].join(', ')} not found`
			)
		}
		if (notFoundList[1].length > 0) {
			throw new BadRequestException(
				`Product category with id ${notFoundList[0].join(', ')} not found`
			)
		}
		if (notFoundList[2].length > 0) {
			throw new BadRequestException(
				`Product option with id ${notFoundList[0].join(', ')} not found`
			)
		}

		const objectKeys = images.map(image =>
			this.fileService.createObjectKey(['store'], image.originalname)
		)

		let result: Store
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const createResult = await Promise.all([
					this.fileService.uploadMulti(images, objectKeys, abortController),
					this.storeService.create(
						{ ...createDTO, images: objectKeys },
						session
					),
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

	@Get('list')
	@ApiSuccessResponse(ResponseStoreListDTO, 200, true)
	async getMetadataStorage(@Query() query: GetListStoreDTO) {
		return this.storeService.getList(query)
	}

	@Get('detail')
	@ApiSuccessResponse(ResponseStoreDetailDTO)
	async getStoreDetail(@Query('id', ObjectIdPipe) storeId: string) {
		return await this.storeService.getStoreDetail(storeId)
	}
}
