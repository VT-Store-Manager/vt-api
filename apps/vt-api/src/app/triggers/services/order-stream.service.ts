/* eslint-disable no-case-declarations */
import {
	ChangeStreamDocument,
	ChangeStreamInsertDocument,
	ChangeStreamUpdateDocument,
} from 'mongodb'
import { Model } from 'mongoose'

import { NotificationType, OrderBuyer, OrderState } from '@/common/constants'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { SettingMemberAppService } from '@module/setting/services/setting-member-app.service'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { MemberData, MemberDataDocument } from '@schema/member-data.schema'
import { MemberNotification } from '@schema/member-notification.schema'
import { MemberRank, MemberRankDocument } from '@schema/member-rank.schema'
import {
	MemberVoucherHistory,
	MemberVoucherHistoryDocument,
	ShortVoucherData,
} from '@schema/member-voucher-history.schema'
import {
	MemberVoucher,
	MemberVoucherDocument,
} from '@schema/member-voucher.schema'
import { OrderMember, OrderMemberDocument } from '@schema/order-member.schema'
import { Order, OrderDocument } from '@schema/order.schema'
import { SettingMemberApp } from '@schema/setting-member-app.schema'

import { StreamHelperService } from './stream-helper.service'

@Injectable()
export class OrderStreamService implements OnModuleInit {
	constructor(
		@InjectModel(Order.name)
		private readonly orderModel: Model<OrderDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>,
		@InjectModel(MemberData.name)
		private readonly memberDataModel: Model<MemberDataDocument>,
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberVoucherHistory.name)
		private readonly memberVoucherHistoryModel: Model<MemberVoucherHistoryDocument>,
		private readonly mongoSessionService: MongoSessionService,
		private readonly settingMemberService: SettingMemberAppService
	) {}

	onModuleInit() {
		const changeStream = this.orderModel.watch(
			[
				{
					$match: {
						$and: [
							{
								$or: [{ operationType: 'update' }, { operationType: 'insert' }],
							},
							{
								$or: [
									{ 'fullDocument.buyer': OrderBuyer.MEMBER },
									{ 'fullDocumentBeforeChange.buyer': OrderBuyer.MEMBER },
								],
							},
						],
					},
				},
				{
					$project: {
						ns: true,
						operationType: true,
						documentKey: true,
						updateDescription: true,
						fullDocument: {
							member: true,
							voucher: true,
						},
						fullDocumentBeforeChange: {
							_id: true,
							member: true,
							voucher: true,
							point: true,
							state: true,
							createdAt: true,
						},
					},
				},
			],
			{
				fullDocumentBeforeChange: 'whenAvailable',
			}
		)

		StreamHelperService.logger.verbose('Order stream watching...')
		changeStream.on('change', (data: ChangeStreamDocument) => {
			switch (data.operationType) {
				case 'insert':
					const insertData =
						data as ChangeStreamInsertDocument<OrderMemberDocument>
					if (!data.fullDocument) return
					this.disableVoucherAfterUsedTrigger(insertData.fullDocument)

					break

				case 'update':
					const updateData =
						data as ChangeStreamUpdateDocument<OrderMemberDocument>
					if (!data.fullDocumentBeforeChange) return
					this.addMemberPointTrigger(
						updateData.fullDocumentBeforeChange,
						updateData.updateDescription.updatedFields
					)
					this.changeMemberVoucherTrigger(
						updateData.fullDocumentBeforeChange,
						updateData.updateDescription.updatedFields
					)
					this.createOrderNotificationTrigger(
						updateData.fullDocumentBeforeChange,
						updateData.updateDescription.updatedFields
					)
					break
			}
		})
	}

	private disableVoucherAfterUsedTrigger(
		data: Pick<OrderMember, 'member' | 'voucher'>
	) {
		if (!data.member || !data.voucher) return

		this.memberVoucherModel
			.updateOne(
				{
					member: data.member.id,
					voucher: data.voucher.id,
					$or: [{ disabled: null }, { disabled: false }],
				},
				{
					$set: { disabled: true },
				}
			)
			.exec()
			.catch(error => StreamHelperService.logger.error(error?.message || error))
	}

	private async addMemberPointTrigger(
		preData: Pick<OrderMember, 'member' | 'point' | 'state'>,
		updateFields: Partial<OrderMember>
	) {
		if (!preData.member) return
		if (
			preData.state !== OrderState.PROCESSING ||
			updateFields?.state !== OrderState.DONE
		)
			return

		try {
			await this.memberRankModel
				.updateOne(
					{
						member: preData.member.id,
					},
					{
						$inc: { currentPoint: preData.point },
					}
				)
				.exec()
			StreamHelperService.logger.verbose(
				`Member ${preData.member.id}: Add ${preData.point} points`
			)
		} catch (error) {
			StreamHelperService.logger.error(error?.message || error)
		}
	}

	private async changeMemberVoucherTrigger(
		preData: Pick<OrderMember, 'member' | 'voucher' | 'state' | 'createdAt'>,
		updateFields: Partial<OrderMember>
	) {
		if (!preData?.member || !preData?.voucher) return
		if (preData.state !== OrderState.PROCESSING || !updateFields?.state) return
		if (![OrderState.DONE, OrderState.CANCELED].includes(updateFields.state))
			return

		switch (updateFields.state) {
			case OrderState.CANCELED:
				this.memberVoucherModel
					.updateOne(
						{
							member: preData.member.id,
							voucher: preData.voucher.id,
							disabled: true,
						},
						{
							disabled: false,
						}
					)
					.then(updateResult =>
						StreamHelperService.logger.verbose(
							`Enable voucher ${
								updateResult.modifiedCount === 1 ? 'successful' : 'failed'
							}`
						)
					)
					.catch(error => StreamHelperService.logger.error(error))

				break
			case OrderState.DONE:
				const memberVouchers = await this.memberVoucherModel
					.aggregate<ShortVoucherData>([
						{
							$match: {
								member: preData.member.id,
								voucher: preData.voucher.id,
								disabled: true,
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
								preserveNullAndEmptyArrays: true,
							},
						},
						{
							$lookup: {
								from: 'partners',
								localField: 'voucher.partner',
								foreignField: '_id',
								as: 'partner',
								pipeline: [
									{
										$project: {
											id: '$_id',
											_id: false,
											name: true,
											image: true,
										},
									},
								],
							},
						},
						{
							$unwind: {
								path: '$partner',
								preserveNullAndEmptyArrays: true,
							},
						},
						{
							$project: {
								_id: false,
								title: { $ifNull: ['$voucher.title', 'Unknown'] },
								image: '$voucher.image',
								code: { $ifNull: ['$voucher.code', 'Unknown'] },
								description: { $ifNull: ['$voucher.description', 'Unknown'] },
								partner: '$partner',
								startTime: '$startTime',
								finishTime: '$finishTime',
							},
						},
					])
					.exec()
				if (!memberVouchers || memberVouchers.length === 0) {
					break
				}
				const shortVoucherData = memberVouchers[0]
				const memberVoucherHistoryData: MemberVoucherHistory = {
					member: preData.member.id,
					voucher: preData.voucher.id,
					voucherData: shortVoucherData,
					usedAt: new Date(preData.createdAt),
				}
				const { error } = await this.mongoSessionService.execTransaction(
					async session => {
						await Promise.all([
							this.memberVoucherHistoryModel.create(
								[
									{
										...memberVoucherHistoryData,
									},
								],
								{ session }
							),
							this.memberVoucherModel.deleteOne(
								{
									member: preData.member.id,
									voucher: preData.voucher.id,
									disabled: true,
								},
								{ session }
							),
						])
						StreamHelperService.logger.verbose(
							'Delete member voucher and insert into voucher history successful'
						)
					}
				)
				if (error) {
					StreamHelperService.logger.error(error)
				}
				break
		}
	}

	private async createOrderNotificationTrigger(
		preData: Pick<OrderMember, '_id' | 'member' | 'state'>,
		updateFields: Partial<OrderMember>
	) {
		if (!preData.member) return
		if (
			preData.state !== OrderState.PROCESSING ||
			updateFields?.state !== OrderState.DONE
		)
			return

		const { notification: notificationSetting } =
			await this.settingMemberService.getData<
				Pick<SettingMemberApp, 'notification'>
			>({ notification: true })

		const notification: MemberNotification = {
			name: notificationSetting.order.name,
			description: notificationSetting.order.description,
			image: notificationSetting.order.image,
			targetId: preData._id,
			type: NotificationType.ORDER,
		}

		const updateResult = await this.memberDataModel
			.updateOne(
				{
					member: preData.member.id,
				},
				{
					$push: {
						notifications: { $each: [notification], $position: 0 },
					},
				}
			)
			.exec()
		if (updateResult.modifiedCount) {
			StreamHelperService.logger.verbose(
				`Member ${preData.member.id}: Add new notification - type ORDER`
			)
		}
	}
}
