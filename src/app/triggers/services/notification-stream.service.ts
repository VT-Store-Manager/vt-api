import { ChangeStreamInsertDocument } from 'mongodb'
import { Model, Types } from 'mongoose'

import { NotificationType } from '@/common/constants'
import { SettingMemberAppService } from '@module/setting/services/setting-member-app.service'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { MemberData, MemberDataDocument } from '@schema/member-data.schema'
import { MemberNotification } from '@schema/member-notification.schema'
import { MemberRank, MemberRankDocument } from '@schema/member-rank.schema'
import {
	MemberVoucher,
	MemberVoucherDocument,
} from '@schema/member-voucher.schema'
import { Notification, NotificationDocument } from '@schema/notification.schema'
import { Promotion, PromotionDocument } from '@schema/promotion.schema'

import { StreamHelperService } from './stream-helper.service'
import { uniq } from 'lodash'

@Injectable()
export class NotificationStreamService implements OnModuleInit {
	constructor(
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<NotificationDocument>,
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>,
		@InjectModel(Promotion.name)
		private readonly promotionModel: Model<PromotionDocument>,
		private readonly settingMemberAppService: SettingMemberAppService
	) {}
	onModuleInit() {
		const changeStream = this.notificationModel.watch([
			{
				$match: {
					operationType: 'insert',
					'fullDocument.immediate': true,
					'fullDocument.targetId': { $ne: null },
					'fullDocument.disabled': { $ne: true },
				},
			},
			{
				$project: {
					fullDocument: true,
				},
			},
		])

		StreamHelperService.logger.verbose('Notification stream watching...')
		changeStream.on(
			'change',
			(data: ChangeStreamInsertDocument<Notification>) => {
				this.createMemberNotificationByType(data.fullDocument)
			}
		)
	}

	private async createMemberNotificationByType(data: Notification) {
		const notification: MemberNotification = {
			name: data.name,
			description: data.description,
			image: data.image,
			targetId: data.targetId,
			type: data.type,
		}
		let memberIds: Types.ObjectId[]
		if (data.type === NotificationType.VOUCHER) {
			const [members, { notification: notificationSetting }] =
				await Promise.all([
					this.memberVoucherModel
						.aggregate<{ id: Types.ObjectId }>([
							{
								$match: {
									voucher: data.targetId,
								},
							},
							{
								$lookup: {
									from: 'vouchers',
									localField: 'voucher',
									foreignField: '_id',
									as: 'voucher',
								},
							},
							{
								$unwind: {
									path: '$voucher',
								},
							},
							{
								$match: {
									startTime: {
										$lte: new Date(),
									},
									$or: [
										{
											finishTime: null,
										},
										{
											finishTime: {
												$gt: new Date(),
											},
										},
									],
									disabled: false,
									'voucher.disabled': false,
									'voucher.deleted': false,
								},
							},
							{
								$project: {
									id: '$member',
									_id: false,
								},
							},
						])
						.exec(),
					this.settingMemberAppService.getData({ notification: true }),
				])
			memberIds = uniq(members.map(member => member.id.toString())).map(
				id => new Types.ObjectId(id)
			)
			if (!notification.image) {
				notification.image = notificationSetting.defaultImage
			}
		} else if (data.type === NotificationType.PROMOTION) {
			const now = new Date()
			const [promotions, { notification: notificationSetting }] =
				await Promise.all([
					this.promotionModel
						.aggregate<Pick<Promotion, 'possibleTarget'>>([
							{
								$match: {
									_id: data.targetId,
									startTime: { $lte: now },
									$or: [{ finishTime: null }, { finishTime: { $gt: now } }],
									disabled: false,
									deleted: false,
								},
							},
							{
								$project: {
									possibleTarget: true,
									_id: false,
								},
							},
						])
						.exec(),
					this.settingMemberAppService.getData({ notification: true }),
				])

			if (promotions.length === 0) return
			const members = await this.memberRankModel
				.aggregate<{ id: Types.ObjectId }>([
					{
						$match:
							Array.isArray(promotions[0].possibleTarget) &&
							promotions[0].possibleTarget.length > 0
								? {
										member: { $in: promotions[0].possibleTarget },
										rank: { $in: promotions[0].possibleTarget },
								  }
								: {},
					},
					{
						$project: {
							id: '$member',
							_id: false,
						},
					},
				])
				.exec()

			memberIds = members.map(member => member.id)
			if (!notification.image) {
				notification.image = notificationSetting.defaultImage
			}
		}

		const updateResult = await this.memberDataModel
			.updateMany(
				{
					member: { $in: memberIds },
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

		StreamHelperService.logger.verbose(
			`Promotion ${data._id.toString()}: Member count ${
				memberIds.length
			}, matched ${updateResult.matchedCount}, modified ${
				updateResult.modifiedCount
			}`
		)
	}
}
