import { ProductCategoryService } from '@/app/admin/product-category/product-category.service'
import { ProductOptionService } from '@/app/admin/product-option/product-option.service'
import { ProductService } from '@/app/admin/product/product.service'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { FileService } from '@module/file/file.service'
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
import { Store } from '@schema/store.schema'

import { CreateStoreDTO } from './dto/create-store.dto'
import { GetListStoreDTO } from './dto/get-list-store.dto'
import { ResponseStoreListDTO } from './dto/response-store-item.dto'
import { StoreAdminService } from './store_admin.service'

@ApiTags('admin-app > store')
@Controller({
	path: 'admin/store',
	version: '1',
})
export class StoreAdminController {
	constructor(
		private readonly storeService: StoreAdminService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService,
		private readonly productService: ProductService,
		private readonly productCategoryService: ProductCategoryService,
		private readonly productOptionService: ProductOptionService
	) {}

	@Post('create')
	@UseInterceptors(
		FilesInterceptor('images', undefined, ImageMulterOption(2, 4))
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
}
