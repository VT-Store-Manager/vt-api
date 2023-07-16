import { ApiSuccessResponse, FileService, ImageMulterOption } from '@app/common'
import { MongoSessionService, News } from '@app/database'
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
import { CreateNewsResultDTO } from './dto/response.dto'
import { NewsService } from './news.service'

@Controller({
	path: 'admin/news',
	version: '1',
})
@ApiTags('admin-app > news')
export class NewsController {
	constructor(
		private readonly newsService: NewsService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post('create')
	@UseInterceptors(FileInterceptor('image'))
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
