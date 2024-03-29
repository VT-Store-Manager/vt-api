import { FileService, ImageMulterOption, ParseFile } from '@app/common'
import { MongoSessionService } from '@app/database'
import { BooleanResponseDTO } from '@app/types'
import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreatePromotionCategoryDTO } from './dto/create-promotion-category.dto'
import { PromotionCategoryService } from './promotion-category.service'

@Controller('admin/promotion-category')
@ApiTags('admin-app > promotion-category')
export class PromotionCategoryController {
	constructor(
		private readonly promotionCategoryService: PromotionCategoryService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image'))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async createPromotionCategory(
		@UploadedFile(ParseFile) image: Express.Multer.File,
		@Body() body: CreatePromotionCategoryDTO
	) {
		const imageKey = this.fileService.createObjectKey(
			['promotion-category'],
			image.originalname
		)
		body.image = imageKey
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				await Promise.all([
					this.fileService.upload(image.buffer, imageKey, abortController),
					this.promotionCategoryService.create(body, session),
				])
			}
		)

		if (error) {
			abortController.abort()
			throw error
		}

		return true
	}
}
