import { ApiSuccessResponse, FileService, ImageMulterOption } from '@app/common'
import { MongoSessionService } from '@app/database'
import { BooleanResponseDTO } from '@app/types'
import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreatePromotionDTO } from './dto/create-promotion.dto'
import { GetPromotionListDTO } from './dto/get-promotion-list.dto'
import { PromotionListPaginationDTO } from './dto/response.dto'
import { PromotionService } from './promotion.service'

@Controller({
	path: 'admin/promotion',
	version: '1',
})
@ApiTags('admin-app > promotion')
export class PromotionController {
	constructor(
		private readonly promotionService: PromotionService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image'))
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
					this.promotionService.create(body, session),
				])
			}
		)
		if (error) {
			abortController.abort()
			throw error
		}
		return true
	}

	@Get('list')
	@ApiSuccessResponse(PromotionListPaginationDTO)
	async getPromotionList(@Query() query: GetPromotionListDTO) {
		return await this.promotionService.getPromotionList(query)
	}
}
