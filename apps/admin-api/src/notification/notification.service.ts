import { ClientSession, Model } from 'mongoose'

import { Notification, NotificationDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateNotificationDTO } from './dto/create-notification.dto'

@Injectable()
export class NotificationService {
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
