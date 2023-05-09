import { ChangeStreamInsertDocument } from 'mongodb'
import { Model } from 'mongoose'

import { NotificationType } from '@/common/constants'
import { MemberData, MemberDataDocument } from '@schema/member-data.schema'
import { MemberNotification } from '@schema/member-notification.schema'
import {
	MemberPromotionHistory,
	MemberPromotionHistoryDocument,
} from '@schema/member-promotion-history.schema'
import { Notification, NotificationDocument } from '@schema/notification.schema'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { StreamHelperService } from './stream-helper.service'

@Injectable()
export class MemberPromotionHistoryStreamService implements OnModuleInit {
	constructor(
		@InjectModel(MemberPromotionHistory.name)
		private readonly memberPromotionHistoryModel: Model<MemberPromotionHistoryDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<NotificationDocument>
	) {}

	onModuleInit() {
		const changeStream = this.memberPromotionHistoryModel.watch([
			{
				$match: { operationType: 'insert' },
			},
			{
				$project: {
					fullDocument: {
						member: true,
						promotion: true,
					},
				},
			},
		])

		StreamHelperService.logger.verbose(
			'Member promotion history stream watching...'
		)
		changeStream.on(
			'change',
			(data: ChangeStreamInsertDocument<MemberPromotionHistory>) => {
				this.createNewVoucherNotificationTrigger(data.fullDocument)
			}
		)
	}

	private async createNewVoucherNotificationTrigger(
		data: Pick<MemberPromotionHistory, 'member' | 'promotion'>
	) {
		const voucherNotification = await this.notificationModel
			.aggregate<MemberNotification>([
				{
					$match: {
						targetId: data.promotion,
						type: NotificationType.VOUCHER,
						disabled: { $ne: true },
						immediate: true,
					},
				},
				{
					$sort: {
						updatedAt: -1,
					},
				},
				{
					$limit: 1,
				},
			])
			.exec()
		if (voucherNotification.length === 0) return
		const notification: MemberNotification = {
			name: voucherNotification[0].name,
			description: voucherNotification[0].description,
			image: voucherNotification[0].image,
			targetId: voucherNotification[0].targetId,
			type: voucherNotification[0].type,
		}
		const updateResult = await this.memberDataModel
			.updateOne(
				{
					member: data.member,
				},
				{
					$push: {
						notifications: {
							$each: [notification],
							$position: 0,
						},
					},
				}
			)
			.exec()

		if (updateResult.modifiedCount === 1) {
			StreamHelperService.logger.verbose(
				`Member ${data.member}: Push new voucher notification`
			)
		}
	}
}
