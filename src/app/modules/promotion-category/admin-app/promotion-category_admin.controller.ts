import { FileService } from '@module/file/file.service'
import { ParseFile } from '@/common/pipes/parse-file.pipe'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { BooleanResponseDTO } from '@/types/swagger'
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
import { PromotionCategoryAdminService } from './promotion-category_admin.service'

@Controller({
	path: 'admin/promotion-category',
	version: '1',
})
@ApiTags('admin-app > promotion-category')
export class PromotionCategoryAdminController {
	constructor(
		private readonly promotionCategoryService: PromotionCategoryAdminService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image', ImageMulterOption(2, 1)))
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
