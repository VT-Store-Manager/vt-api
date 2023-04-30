import { Model, Types } from 'mongoose'

import { getImagePath } from '@/common/helpers/file.helper'
import {
	MemberVoucher,
	MemberVoucherDocument,
} from '@/schemas/member-voucher.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { AvailableMemberVoucherDTO } from '../admin-app/dto/response.dto'

@Injectable()
export class MemberVoucherMemberService {
	constructor(
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>
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
}
