import { ImageMulterOption } from '@/common/validations/file.validator'
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

import { CreateNewsDTO } from './dto/create-news.dto'
import { NewsAdminService } from './news_admin.service'
import { FileService } from '@module/file/file.service'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { News } from '@schema/news.schema'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { CreateNewsResultDTO } from './dto/response.dto'

@Controller({
	path: 'admin/news',
	version: '1',
})
@ApiTags('admin-app > news')
export class NewsAdminController {
	constructor(
		private readonly newsService: NewsAdminService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image', ImageMulterOption()))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(CreateNewsResultDTO, 201)
	async createNews(
		@UploadedFile() image: Express.Multer.File,
		@Body() body: CreateNewsDTO
	) {
		const imageKey = this.fileService.createObjectKey(
			['news'],
			image.originalname
		)
		body.image = imageKey

		const abortController = new AbortController()
		let result: News
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				;[result] = await Promise.all([
					this.newsService.create(body, session),
					this.fileService.upload(image.buffer, imageKey, abortController),
				])
			}
		)

		if (error) {
			abortController.abort()
			throw new InternalServerErrorException(error.message)
		}

		return {
			id: result._id,
		}
	}
}
