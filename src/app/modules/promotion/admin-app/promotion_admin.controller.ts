import { FileService } from '@module/file/file.service'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { BooleanResponseDTO } from '@/types/swagger'
import {
	Body,
	Controller,
	InternalServerErrorException,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreatePromotionDTO } from './dto/create-promotion.dto'
import { PromotionAdminService } from './promotion_admin.service'

@Controller({
	path: 'admin/promotion',
	version: '1',
})
@ApiTags('admin-app > promotion')
export class PromotionAdminController {
	constructor(
		private readonly promotionAdminService: PromotionAdminService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image', ImageMulterOption(2, 1)))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async createPromotion(
		@UploadedFile() image: Express.Multer.File,
		@Body() body: CreatePromotionDTO
	) {
		let imageKey: string = null
		if (image) {
			imageKey = this.fileService.createObjectKey(
				['promotion'],
				image.originalname
			)
		}
		body.image = imageKey
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				await Promise.all([
					image
						? this.fileService.upload(image.buffer, imageKey, abortController)
						: null,
					this.promotionAdminService.create(body, session),
				])
			}
		)
		if (error) {
			abortController.abort()
			throw new InternalServerErrorException(error.message)
		}
		return true
	}
}
