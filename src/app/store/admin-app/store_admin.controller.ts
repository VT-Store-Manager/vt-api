import { FileService } from '@/app/file/file.service'
import { ProductCategoryAdminService } from '@/app/product-category/admin-app/product-category_admin.service'
import { ProductOptionAdminService } from '@/app/product-option/admin-app/product-option.service'
import { ProductAdminService } from '@/app/product/admin-app/product_admin.service'
import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { MongoSessionService } from '@/providers/mongo/session.service'
import { Store } from '@/schemas/store.schema'
import {
	BadRequestException,
	Body,
	Controller,
	Get,
	InternalServerErrorException,
	Post,
	Query,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

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
		private readonly productService: ProductAdminService,
		private readonly productCategoryService: ProductCategoryAdminService,
		private readonly productOptionService: ProductOptionAdminService
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
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const createResult = await Promise.all([
					this.fileService.uploadMulti(images, objectKeys),
					this.storeService.create(
						{ ...createDTO, images: objectKeys },
						session
					),
				])
				result = createResult[1]
			}
		)

		if (error) {
			const existedKeys = await objectKeys.filter(
				async key => await this.fileService.checkFile(key)
			)
			await this.fileService.delete(existedKeys)
			throw new InternalServerErrorException()
		}

		return result
	}

	@Get('list')
	@ApiSuccessResponse(ResponseStoreListDTO, 200, true)
	async getMetadataStorage(@Query() query: GetListStoreDTO) {
		return this.storeService.getList(query)
	}
}