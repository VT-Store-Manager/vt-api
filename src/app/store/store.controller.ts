import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { MongoService } from '@/common/providers/mongo.service'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { Store } from '@/schemas/store.schema'
import {
	BadRequestException,
	Body,
	Controller,
	Post,
	UploadedFiles,
	UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

import { FileService } from '../file/file.service'
import { ProductCategoryService } from '../product-category/product-category.service'
import { ProductOptionService } from '../product-option/product-option.service'
import { ProductService } from '../product/product.service'
import { CreateStoreDto } from './dto/create-store.dto'
import { StoreService } from './store.service'

@ApiTags('store')
@Controller({
	path: 'store',
	version: '1',
})
export class StoreController {
	constructor(
		private readonly storeService: StoreService,
		private readonly fileService: FileService,
		private readonly mongoService: MongoService,
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
		@Body() createDto: CreateStoreDto
	) {
		const notFoundList = await Promise.all([
			this.productService.isExist(...createDto.unavailableKinds.product),
			this.productCategoryService.isExist(
				...createDto.unavailableKinds.category
			),
			this.productOptionService.isExist(...createDto.unavailableKinds.option),
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
		const { result, err } = await this.mongoService.transaction<Store>({
			transactionCb: async session => {
				const createResult = await Promise.all([
					this.fileService.uploadMulti(images, objectKeys),
					this.storeService.create(
						{ ...createDto, images: objectKeys },
						session
					),
				])
				return createResult[1]
			},
			errorCb: async _err => {
				const existedKeys = await objectKeys.filter(
					async key => await this.fileService.checkFile(key)
				)
				await this.fileService.delete(existedKeys)
			},
		})

		if (err) throw err

		return result
	}
}
