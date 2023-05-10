import { Model, Types } from 'mongoose'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { NotificationDocument, Notification } from '@schema/notification.schema'
import { MemberData, MemberDataDocument } from '@schema/member-data.schema'
import { MemberNotificationItemDTO } from './dto/response.dto'
import { SettingMemberAppService } from '../../setting/services/setting-member-app.service'

@Injectable()
export class NotificationMemberService {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<NotificationDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		private readonly settingMemberAppService: SettingMemberAppService
	) {}

	async getAll(memberId: string) {
		const [memberData, { notification: notificationSetting }] =
			await Promise.all([
				this.memberDataModel
					.aggregate<{ notifications: MemberNotificationItemDTO[] }>([
						{
							$match: {
								member: new Types.ObjectId(memberId),
							},
						},
						{
							$project: {
								notifications: {
									$map: {
										input: '$notifications',
										as: 'e',
										in: {
											id: '$$e._id',
											name: '$$e.name',
											description: '$$e.name',
											time: { $toLong: '$$e.createdAt' },
											image: '$$e.image',
											targetId: '$$e.targetId',
											checked: '$$e.checked',
											type: '$$e.type',
										},
									},
								},
								_id: false,
							},
						},
					])
					.exec(),
				this.settingMemberAppService.getData({ notification: true }),
			])
		if (memberData.length === 0) {
			throw new BadRequestException('Member data not found')
		}
		return memberData[0].notifications
			.slice(0, notificationSetting.limit)
			.map(item => ({
				...item,
				...(!item.image ? { image: notificationSetting.defaultImage } : {}),
			}))
	}
}
