import { Model, Types } from 'mongoose'

import { getImagePath } from '@/common/helpers/file.helper'
import {
	MemberVoucherHistory,
	MemberVoucherHistoryDocument,
} from '@schema/member-voucher-history.schema'
import {
	MemberVoucher,
	MemberVoucherDocument,
} from '@schema/member-voucher.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import {
	AvailableMemberVoucherDTO,
	UsedMemberVoucherDTO,
} from './dto/response.dto'
import { SettingGeneralService } from '@module/setting/services/setting-general.service'
import { SettingGeneral } from '@schema/setting-general.schema'

@Injectable()
export class MemberVoucherMemberService {
	constructor(
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberVoucherHistory.name)
		private readonly memberVoucherHistoryModel: Model<MemberVoucherHistoryDocument>,
		private readonly settingGeneralService: SettingGeneralService
	) {}

	async getMemberAvailableVoucher(memberId: string) {
		const now = new Date()

		const availableVouchers = await this.memberVoucherModel
			.aggregate<AvailableMemberVoucherDTO>([
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
						'voucher.disabled': false,
						'voucher.deleted': false,
						member: new Types.ObjectId(memberId),
						startTime: { $lte: now },
						finishTime: { $gt: now },
						disabled: false,
						$and: [
							{
								$or: [
									{ 'voucher.activeStartTime': null },
									{ 'voucher.activeStartTime': { $lte: now } },
								],
							},
							{
								$or: [
									{ 'voucher.activeStartTime': null },
									{ 'voucher.activeStartTime': { $lte: now } },
								],
							},
						],
					},
				},
				{
					$project: {
						id: '$_id',
						_id: false,
						code: '$voucher.code',
						name: '$voucher.title',
						image: '$voucher.image',
						partner: '$voucher.partner',
						sliderImage: '$voucher.slider',
						from: '$startTime',
						to: '$finishTime',
						description: '$voucher.description',
					},
				},
				{
					$sort: {
						to: 1,
						from: 1,
					},
				},
			])
			.exec()

		return availableVouchers.map(voucher => ({
			...voucher,
			...(voucher.image ? { image: getImagePath(voucher.image) } : {}),
			...(voucher.sliderImage
				? { sliderImage: getImagePath(voucher.sliderImage) }
				: {}),
		}))
	}

	async getMemberUsedVoucher(
		memberId: string
	): Promise<UsedMemberVoucherDTO[]> {
		const [generalSetting, usedVouchers] = await Promise.all([
			this.settingGeneralService.getData<Pick<SettingGeneral, 'brand'>>({
				brand: true,
			}),
			this.memberVoucherHistoryModel
				.aggregate<UsedMemberVoucherDTO>([
					{
						$match: {
							member: new Types.ObjectId(memberId),
						},
					},
					{
						$project: {
							id: '$_id',
							_id: false,
							code: '$voucherData.code',
							name: '$voucherData.title',
							image: '$voucherData.image',
							partner: '$partner.name',
							usedAt: '$usedAt',
							from: '$voucherData.startTime',
							to: '$voucherData.finishTime',
							description: '$voucher.description',
						},
					},
					{
						$sort: {
							usedAt: -1,
						},
					},
				])
				.exec(),
		])
		return usedVouchers.map(voucher => ({
			...voucher,
			...(voucher.partner
				? {}
				: {
						partner: generalSetting.brand.name,
				  }),
		}))
	}
}
