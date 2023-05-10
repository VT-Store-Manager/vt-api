import { ChangeStreamInsertDocument } from 'mongodb'
import { Model } from 'mongoose'

import { NotificationType } from '@/common/constants'
import { MemberData, MemberDataDocument } from '@schema/member-data.schema'
import { MemberNotification } from '@schema/member-notification.schema'
import {
	MemberVoucher,
	MemberVoucherDocument,
} from '@schema/member-voucher.schema'
import { Notification, NotificationDocument } from '@schema/notification.schema'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { StreamHelperService } from './stream-helper.service'
import { SettingMemberAppService } from '@/app/modules/setting/services/setting-member-app.service'

@Injectable()
export class MemberVoucherStreamService implements OnModuleInit {
	constructor(
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<NotificationDocument>,
		private readonly settingMemberAppService: SettingMemberAppService
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
		const [voucherNotification, { notification: notificationSetting }] =
			await Promise.all([
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
				this.settingMemberAppService.getData({ notification: true }),
			])
		if (voucherNotification.length === 0) return
		const notification: MemberNotification = {
			name: voucherNotification[0].name,
			description: voucherNotification[0].description,
			image: voucherNotification[0].image || notificationSetting.defaultImage,
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
