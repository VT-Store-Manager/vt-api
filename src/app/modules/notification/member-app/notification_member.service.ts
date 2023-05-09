import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { NotificationDocument, Notification } from '@schema/notification.schema'
import { MemberData, MemberDataDocument } from '@schema/member-data.schema'

@Injectable()
export class NotificationMemberService {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<NotificationDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>
	) {}
}
