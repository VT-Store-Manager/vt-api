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

import { CreatePartnerDTO } from './dto/create_partner.dto'
import { PartnerService } from './partner.service'

@Controller({
	path: 'admin/partner',
	version: '1',
})
@ApiTags('admin-app > partner')
export class PartnerController {
	constructor(
		private readonly partnerService: PartnerService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image'))
	@ApiConsumes('multipart/form-data')
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async createPartner(
		@UploadedFile(ParseFile) image: Express.Multer.File,
		@Body() dto: CreatePartnerDTO
	) {
		const imageKey = this.fileService.createObjectKey(
			['partner'],
			image.originalname
		)
		dto.image = imageKey

		const abortController = new AbortController()
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				await Promise.all([
					this.fileService.upload(image.buffer, imageKey, abortController),
					this.partnerService.create(dto, session),
				])
			}
		)

		if (error) {
			abortController.abort()
			error.message = 'Create partner failed. ' + error.message
			throw error
		}

		return true
	}
}
