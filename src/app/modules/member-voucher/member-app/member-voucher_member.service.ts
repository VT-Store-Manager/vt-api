import { Model, Types } from 'mongoose'

import { s3KeyPattern } from '@/common/constants'
import { SettingGeneralService } from '@module/setting/services/setting-general.service'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import {
	MemberVoucherHistory,
	MemberVoucherHistoryDocument,
} from '@schema/member-voucher-history.schema'
import {
	MemberVoucher,
	MemberVoucherDocument,
} from '@schema/member-voucher.schema'
import { SettingGeneral } from '@schema/setting-general.schema'

import {
	AvailableMemberVoucherDTO,
	UsedMemberVoucherDTO,
} from './dto/response.dto'

@Injectable()
export class MemberVoucherMemberService {
	private readonly imageUrl: string
	constructor(
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberVoucherHistory.name)
		private readonly memberVoucherHistoryModel: Model<MemberVoucherHistoryDocument>,
		private readonly settingGeneralService: SettingGeneralService,
		private readonly configService: ConfigService
	) {
		this.imageUrl = configService.get<string>('imageUrl')
	}

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
						image: {
							$cond: [
								{
									$regexMatch: {
										input: '$voucher.image',
										regex: s3KeyPattern,
									},
								},
								{ $concat: [this.imageUrl, '$voucher.image'] },
								null,
							],
						},
						partner: '$voucher.partner',
						sliderImage: {
							$cond: [
								{
									$regexMatch: {
										input: '$voucher.slider',
										regex: s3KeyPattern,
									},
								},
								{ $concat: [this.imageUrl, '$voucher.slider'] },
								null,
							],
						},
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

		return availableVouchers
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
							image: {
								$cond: [
									{
										$regexMatch: {
											input: '$voucherData.image',
											regex: s3KeyPattern,
										},
									},
									{ $concat: [this.imageUrl, '$voucherData.image'] },
									null,
								],
							},
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
