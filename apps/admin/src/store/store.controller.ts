import {
	ApiSuccessResponse,
	FileService,
	ImageMulterOption,
	ObjectIdPipe,
	ParseFile,
	ParseFileOptional,
} from '@app/common'
import { MongoSessionService, Store } from '@app/database'
import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Patch,
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
import { StoreEditImageDTO } from './dto/response-store-edit-image.dto'
import { EditImageStoreDTO } from './dto/edit-image-store.dto'
import { difference } from 'lodash'
import { UpdateUnavailableGoodsDTO } from './dto/update-unavailable-goods.dto'
import { UpdateStoreInfoDTO } from './dto/update-store-info.dto'

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

	@Patch('update-image')
	@UseInterceptors(
		FilesInterceptor('files', undefined, ImageMulterOption(2, 6))
	)
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(StoreEditImageDTO)
	async editImages(
		@UploadedFiles(ParseFileOptional)
		files: Express.Multer.File[],
		@Query('id', ObjectIdPipe) storeId: string,
		@Body() body: EditImageStoreDTO
	) {
		// Map index of image url
		const imageUrlIndexMap = body.imageMap.reduce((res, image) => {
			if (!/^\[\d+\]:/.test(image)) {
				throw new BadRequestException(
					'Image url in payload is invalid ' + image
				)
			}
			const [index, ...urls] = image.split(':')
			res[index.slice(1, -1)] = urls.join(':')
			return res
		}, {} as Record<number | string, string>)
		// Current images of store
		const storeImages = await this.storeService.getStoreImages(storeId)
		// Delete images after update
		const deletedImages = difference(
			storeImages,
			Object.values(imageUrlIndexMap)
		)
		// S3 keys of new images from file
		const fileS3Keys = files.map(image =>
			this.fileService.createObjectKey(['store'], image.originalname)
		)
		// Store images after updated
		const storeUpdatedImages = Object.keys(imageUrlIndexMap)
			.map(v => +v)
			.sort()
			.reduce((result, imageIndex) => {
				result.splice(
					+imageIndex,
					0,
					imageUrlIndexMap[imageIndex] || imageUrlIndexMap[imageIndex + '']
				)
				return result
			}, fileS3Keys)

		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const [updateSucceed] = await Promise.all([
					this.storeService.updateStoreImage(
						storeId,
						storeUpdatedImages,
						session
					),
					this.fileService.uploadMulti(files, fileS3Keys, abortController),
				])
				if (updateSucceed) {
					this.fileService.delete(deletedImages, abortController)
				}
			}
		)
		if (error) {
			abortController.abort()
			this.fileService.delete(fileS3Keys)
			throw error
		}

		return storeUpdatedImages
	}

	@Patch('unavailable-goods')
	async updateUnavailableGoods(@Body() body: UpdateUnavailableGoodsDTO) {
		return await this.storeService.updateStoreUnavailableGoods(body)
	}

	@Patch('info')
	async updateStoreInfo(@Body() body: UpdateStoreInfoDTO) {
		return await this.storeService.updateStoreInfo(body)
	}
}
