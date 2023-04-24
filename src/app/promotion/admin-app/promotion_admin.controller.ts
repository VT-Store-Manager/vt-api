import { FileService } from '@/app/file/file.service'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { MongoSessionService } from '@/providers/mongo/session.service'
import {
	Body,
	Controller,
	InternalServerErrorException,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'

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
	async createPromotion(
		@UploadedFile() image: Express.Multer.File,
		@Body() body: CreatePromotionDTO
	) {
		if (!image) {
			const promotion = await this.promotionAdminService.create(body)
			return !!promotion
		}
		const imageKey = this.fileService.createObjectKey(
			['promotion'],
			image.originalname
		)
		body.image = imageKey
		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				await Promise.all([
					this.fileService.upload(image.buffer, imageKey, abortController),
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
