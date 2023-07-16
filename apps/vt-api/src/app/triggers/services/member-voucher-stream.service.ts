import { ChangeStreamInsertDocument } from 'mongodb'
import { Model } from 'mongoose'

import { NotificationType } from '@app/common'
import {
	MemberData,
	MemberDataDocument,
	MemberNotification,
	MemberVoucher,
	MemberVoucherDocument,
	Notification,
	NotificationDocument,
} from '@app/database'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { StreamHelperService } from './stream-helper.service'

@Injectable()
export class MemberVoucherStreamService implements OnModuleInit {
	constructor(
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<NotificationDocument>
	) {}

	onModuleInit() {
		const changeStream = this.memberVoucherModel.watch([
			{
				$match: { operationType: 'insert' },
			},
			{
				$project: {
					fullDocument: {
						member: true,
						voucher: true,
					},
				},
			},
		])
		StreamHelperService.logger.verbose('Member voucher stream watching...')
		changeStream.on(
			'change',
			(data: ChangeStreamInsertDocument<MemberVoucher>) => {
				if (!data.fullDocument) return
				this.createNewVoucherNotificationTrigger(data.fullDocument)
			}
		)
	}

	private async createNewVoucherNotificationTrigger(
		data: Pick<MemberVoucher, 'member' | 'voucher'>
	) {
		const [voucherNotification] = await Promise.all([
			this.notificationModel
				.aggregate<MemberNotification>([
					{
						$match: {
							targetId: data.voucher,
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
				.exec(),
		])
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
