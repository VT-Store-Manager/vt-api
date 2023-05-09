import { ChangeStreamInsertDocument } from 'mongodb'
import { Model, Types } from 'mongoose'

import { SettingMemberAppService } from '@/app/modules/setting/services/setting-member-app.service'
import { NotificationType } from '@/common/constants'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { MemberData, MemberDataDocument } from '@schema/member-data.schema'
import { MemberNotification } from '@schema/member-notification.schema'
import { MemberRank, MemberRankDocument } from '@schema/member-rank.schema'
import { Notification, NotificationDocument } from '@schema/notification.schema'
import { Promotion, PromotionDocument } from '@schema/promotion.schema'

import { StreamHelperService } from './stream-helper.service'

@Injectable()
export class PromotionStreamService implements OnModuleInit {
	constructor(
		@InjectModel(Promotion.name)
		private readonly promotionModel: Model<PromotionDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		@InjectModel(Notification.name)
		private readonly notificationModel: Model<NotificationDocument>,
		private readonly settingMemberAppService: SettingMemberAppService
	) {}

	onModuleInit() {
		const changeStream = this.promotionModel.watch(
			[
				{
					$match: {
						'fullDocument.disabled': false,
						'fullDocument.deleted': false,
						'fullDocument.startTime': { $lte: new Date() },
						$or: [{ finishTime: { $gt: new Date() } }, { finishTime: null }],
					},
				},
				{
					$project: {
						operationType: true,
						updateDescription: true,
						fullDocument: {
							_id: true,
							possibleTarget: true,
						},
					},
				},
			],
			{
				fullDocument: 'whenAvailable',
			}
		)

		StreamHelperService.logger.verbose('Promotion stream watching...')
		changeStream.on('change', (data: ChangeStreamInsertDocument<Promotion>) => {
			this.createNewPromotionNotificationTrigger(data.fullDocument)
		})
	}

	private async createNewPromotionNotificationTrigger(
		data: Pick<Promotion, '_id' | 'possibleTarget'>
	) {
		const [promotionNotification, { notification: notificationSetting }] =
			await Promise.all([
				this.notificationModel
					.aggregate<MemberNotification>([
						{
							$match: {
								targetId: data._id,
								type: NotificationType.PROMOTION,
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

		if (promotionNotification.length === 0) return

		const members = await this.memberRankModel
			.aggregate<{ id: Types.ObjectId }>([
				{
					$match:
						Array.isArray(data.possibleTarget) && data.possibleTarget.length > 0
							? {
									$or: [
										{ rank: { $in: data.possibleTarget } },
										{ member: { $in: data.possibleTarget } },
									],
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

		const notification: MemberNotification = {
			name: promotionNotification[0].name,
			description: promotionNotification[0].description,
			image: promotionNotification[0].image || notificationSetting.defaultImage,
			targetId: promotionNotification[0].targetId,
			type: promotionNotification[0].type,
		}

		const updateResult = await this.memberDataModel
			.updateMany(
				{
					member: { $in: members.map(member => member.id) },
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
				members.length
			}, matched ${updateResult.matchedCount}, modified ${
				updateResult.modifiedCount
			}`
		)
	}
}