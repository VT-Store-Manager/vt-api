import { FileService } from '@module/file/file.service'
import { SettingMemberAppService } from '@module/setting/services/setting-member-app.service'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { RemoveNullishObjectPipe } from '@/common/pipes/object.pipe'
import { ImageMulterOption } from '@/common/validations/file.validator'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { MemberNotification } from '@schema/member-notification.schema'
import { Notification } from '@schema/notification.schema'
import { SettingMemberApp } from '@schema/setting-member-app.schema'
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
import { NotificationAdminService } from './notification_admin.service'

@Controller({
	path: 'admin/notification',
	version: '1',
})
@ApiTags('admin-app > notification')
export class NotificationAdminController {
	constructor(
		private readonly notificationService: NotificationAdminService,
		private readonly settingMemberAppService: SettingMemberAppService,
		private readonly fileService: FileService,
		private readonly mongoSessionService: MongoSessionService
	) {}

	@Post()
	@UseInterceptors(FileInterceptor('image', ImageMulterOption(2, 1)))
	@ApiConsumes('multipart/form-data')
	@ApiSuccessResponse(MemberNotification, 201)
	async createNotification(
		@UploadedFile() image: Express.Multer.File,
		@Body(RemoveNullishObjectPipe) body: CreateNotificationDTO
	) {
		let imageKey: string
		if (!image) {
			const { notification } = await this.settingMemberAppService.getData<
				Pick<SettingMemberApp, 'notification'>
			>({ notification: true })
			imageKey = notification.defaultImage || undefined
		} else {
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
