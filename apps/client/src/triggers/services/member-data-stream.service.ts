import { ChangeStreamUpdateDocument } from 'mongodb'
import { Model, Types } from 'mongoose'

import { SettingMemberAppService } from '@app/common'
import {
	MemberData,
	MemberDataDocument,
	MongoSessionService,
} from '@app/database'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { StreamHelperService } from './stream-helper.service'

type MemberNotificationAmount = {
	member: Types.ObjectId
	notificationCount: number
}

@Injectable()
export class MemberDataStreamService implements OnModuleInit {
	constructor(
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		private readonly mongoSessionService: MongoSessionService,
		private readonly settingMemberAppService: SettingMemberAppService
	) {}

	onModuleInit() {
		const changeStream = this.memberDataModel.watch(
			[
				{
					$match: {
						operationType: { $in: ['update', 'replace'] },
					},
				},
				{
					$project: {
						fullDocument: {
							member: true,
							notificationCount: { $size: '$fullDocument.notifications' },
						},
					},
				},
			],
			{
				fullDocument: 'whenAvailable',
			}
		)

		StreamHelperService.logger.debug('Member data stream watching...')
		changeStream.on(
			'change',
			(data: ChangeStreamUpdateDocument<MemberNotificationAmount>) => {
				if (!data.fullDocument) return
				this.popNotification(data.fullDocument)
			}
		)
	}

	private async popNotification(data: MemberNotificationAmount) {
		const { notification: notificationSetting } =
			await this.settingMemberAppService.getData({
				notification: { limit: true },
			})
		if (data.notificationCount <= notificationSetting.limit) return

		let result: Pick<MemberData, 'notifications'>
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const updateResult = await this.memberDataModel.updateOne(
					{
						member: data.member,
					},
					{
						$unset: {
							...Array.from(
								{ length: data.notificationCount - notificationSetting.limit },
								(_, i) => i + notificationSetting.limit
							).reduce((res, v) => ({ ...res, [`notifications.${v}`]: 1 }), {}),
						},
					},
					{
						session,
					}
				)
				if (updateResult.modifiedCount === 0) return
				result = await this.memberDataModel
					.findOneAndUpdate(
						{ member: data.member },
						{
							$pull: { notifications: null },
						},
						{ session, new: true }
					)
					.select('notifications')
					.lean()
					.exec()
			}
		)

		if (error) {
			StreamHelperService.logger.error(error.message)
		} else {
			const deletedAmount = data.notificationCount - result.notifications.length
			StreamHelperService.logger.verbose(
				`Member ${data.member.toString()}: Pop ${deletedAmount} notification${
					deletedAmount > 1 ? 's' : ''
				}`
			)
		}
	}
}
