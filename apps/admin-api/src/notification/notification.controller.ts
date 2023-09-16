import {
	ApiSuccessResponse,
	FileService,
	ImageMulterOption,
	RemoveNullishObjectPipe,
} from '@app/common'
import {
	MemberNotification,
	MongoSessionService,
	Notification,
} from '@app/database'
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

import { CreateNotificationDTO } from './dto/create-notification.dto'
import { NotificationService } from './notification.service'

@Controller('admin/notification')
@ApiTags('admin-app > notification')
export class NotificationController {
	constructor(
		private readonly notificationService: NotificationService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post()
	@UseInterceptors(FileInterceptor('image'))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(MemberNotification, 201)
	async createNotification(
		@UploadedFile() image: Express.Multer.File,
		@Body(RemoveNullishObjectPipe) body: CreateNotificationDTO
	) {
		let imageKey = ''
		if (image) {
			imageKey = this.fileService.createObjectKey(
				['notification'],
				image.originalname
			)
		}
		body.image = imageKey
		const abortController = new AbortController()
		let result: Notification
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const [notification] = await Promise.all([
					this.notificationService.createNotification(body, session),
					image
						? this.fileService.upload(image.buffer, imageKey, abortController)
						: null,
				])
				result = notification
			}
		)
		if (error) {
			abortController.abort()
			throw new InternalServerErrorException(error.message)
		}
		return result
	}
}
