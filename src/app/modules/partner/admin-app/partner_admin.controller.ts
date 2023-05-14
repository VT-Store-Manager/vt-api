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

import { CreatePartnerDTO } from './dto/create_partner.dto'
import { PartnerAdminService } from './partner_admin.service'

@Controller({
	path: 'admin/partner',
	version: '1',
})
@ApiTags('admin-app > partner')
export class PartnerAdminController {
	constructor(
		private readonly partnerService: PartnerAdminService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image', ImageMulterOption(2, 1)))
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
