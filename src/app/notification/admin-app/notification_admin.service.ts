import { ClientSession, Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import {
	NotificationDocument,
	Notification,
} from '@/schemas/notification.schema'
import { CreateNotificationDTO } from './dto/create-notification.dto'

@Injectable()
export class NotificationAdminService {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<NotificationDocument>
	) {}

	async createNotification(
		data: CreateNotificationDTO,
		session?: ClientSession
	): Promise<Notification> {
		const [createdData] = await this.notificationModel.create(
			[{ ...data }],
			session ? { session } : {}
		)
		return createdData
	}
}
