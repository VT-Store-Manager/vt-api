import { uniq } from 'lodash'
import { ChangeStreamInsertDocument } from 'mongodb'
import { Model, Types } from 'mongoose'

import {
	NotificationType,
	SettingMemberAppService,
	ChangeStreamLogger,
} from '@app/common'
import {
	MemberData,
	MemberDataDocument,
	MemberNotification,
	MemberRank,
	MemberRankDocument,
	MemberVoucher,
	MemberVoucherDocument,
	Notification,
	NotificationDocument,
	Promotion,
	PromotionDocument,
} from '@app/database'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

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

		ChangeStreamLogger.debug('Notification stream watching...')
		changeStream.on(
			'change',
			(data: ChangeStreamInsertDocument<Notification>) => {
				if (!data.fullDocument) return
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
			const [members] = await Promise.all([
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
			])
			memberIds = uniq(members.map(member => member.id.toString())).map(
				id => new Types.ObjectId(id)
			)
		} else if (data.type === NotificationType.PROMOTION) {
			const now = new Date()
			const [promotions] = await Promise.all([
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

		ChangeStreamLogger.verbose(
			`Promotion ${data._id.toString()}: Member count ${
				memberIds.length
			}, matched ${updateResult.matchedCount}, modified ${
				updateResult.modifiedCount
			}`
		)
	}
}
