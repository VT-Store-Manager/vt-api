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
import { SettingMemberAppService } from '@module/setting/services/setting-member-app.service'
import { SettingMemberApp } from '@/database/schemas/setting-member-app.schema'

@Injectable()
export class MemberVoucherService {
	private readonly imageUrl: string
	constructor(
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberVoucherHistory.name)
		private readonly memberVoucherHistoryModel: Model<MemberVoucherHistoryDocument>,
		private readonly settingGeneralService: SettingGeneralService,
		private readonly settingMemberAppService: SettingMemberAppService,
		private readonly configService: ConfigService
	) {
		this.imageUrl = configService.get<string>('imageUrl')
	}

	async getMemberAvailableVoucher(memberId: string) {
		const { defaultImages } = await this.settingMemberAppService.getData<
			Pick<SettingMemberApp, 'defaultImages'>
		>({
			defaultImages: true,
		})
		const now = new Date()

		const [{ brand }, availableVouchers] = await Promise.all([
			this.settingGeneralService.getData<Pick<SettingGeneral, 'brand'>>({
				brand: true,
			}),
			this.memberVoucherModel
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
										{ 'voucher.activeFinishTime': null },
										{ 'voucher.activeFinishTime': { $gt: now } },
									],
								},
							],
						},
					},
					{
						$lookup: {
							from: 'partners',
							localField: 'partner',
							foreignField: '_id',
							as: 'partner',
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
							id: '$voucher._id',
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
									{ $concat: [this.imageUrl, defaultImages.voucher] },
								],
							},
							partner: '$voucher.partner.name',
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
							from: { $toLong: '$startTime' },
							to: { $toLong: '$finishTime' },
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
				.exec(),
		])

		return availableVouchers.map(voucher => ({
			...voucher,
			...(voucher.partner
				? {}
				: {
						partner: brand.name,
				  }),
		}))
	}

	async getMemberUsedVoucher(
		memberId: string
	): Promise<UsedMemberVoucherDTO[]> {
		const { defaultImages } = await this.settingMemberAppService.getData<
			Pick<SettingMemberApp, 'defaultImages'>
		>({
			defaultImages: true,
		})
		const [{ brand }, usedVouchers] = await Promise.all([
			this.settingGeneralService.getData<Pick<SettingGeneral, 'brand'>>({
				brand: true,
				defaultImages: true,
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
									{ $concat: [this.imageUrl, defaultImages.voucher] },
								],
							},
							partner: '$partner.name',
							usedAt: { $toLong: '$usedAt' },
							from: { $toLong: '$voucherData.startTime' },
							to: { $toLong: '$voucherData.finishTime' },
							description: '$voucherData.description',
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
						partner: brand.name,
				  }),
		}))
	}
}
