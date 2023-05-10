import { Model, Types } from 'mongoose'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { MemberData, MemberDataDocument } from '@schema/member-data.schema'
import { MemberNotificationItemDTO } from './dto/response.dto'
import { SettingMemberAppService } from '../../setting/services/setting-member-app.service'

@Injectable()
export class NotificationMemberService {
	constructor(
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

	async check(memberId: string, notificationId: string) {
		const notifications = await this.memberDataModel
			.aggregate<{ index: number }>([
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
								as: 'el',
								in: '$$el._id',
							},
						},
						_id: false,
					},
				},
				{
					$project: {
						index: {
							$indexOfArray: [
								'$notifications',
								new Types.ObjectId(notificationId),
							],
						},
					},
				},
			])
			.exec()

		if (notifications.length === 0) {
			throw new BadRequestException('Member data not found')
		}
		const { index } = notifications[0]
		if (index === -1) {
			throw new BadRequestException('Member notification not found')
		}

		const updateResult = await this.memberDataModel.updateOne(
			{
				member: new Types.ObjectId(memberId),
			},
			{
				$set: {
					[`notifications.${index}.checked`]: true,
				},
			}
		)

		return updateResult.modifiedCount === 1
	}
}
