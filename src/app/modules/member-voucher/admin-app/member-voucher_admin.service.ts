import { ClientSession, Model, Types } from 'mongoose'

import { MemberRank, MemberRankDocument } from '@schema/member-rank.schema'
import {
	MemberVoucher,
	MemberVoucherDocument,
} from '@schema/member-voucher.schema'
import { Voucher, VoucherDocument } from '@schema/voucher.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { AssignVoucherDTO } from './dto/create-member-voucher.dto'

@Injectable()
export class MemberVoucherAdminService {
	constructor(
		@InjectModel(Voucher.name)
		private readonly voucherModel: Model<VoucherDocument>,
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>
	) {}

	async createMemberVoucher(data: AssignVoucherDTO, session?: ClientSession) {
		const targetObjectIds = data.target.map(id => new Types.ObjectId(id))
		const [members, voucher] = await Promise.all([
			this.memberRankModel
				.aggregate<{
					member: Types.ObjectId
				}>()
				.match({
					$or: [
						{ member: { $in: targetObjectIds } },
						{ rank: { $in: targetObjectIds } },
					],
				})
				.project({
					member: true,
					_id: false,
				})
				.exec(),
			this.voucherModel
				.findById(data.voucher)
				.orFail(new BadRequestException('Voucher not found'))
				.select('expireHour')
				.lean()
				.exec(),
		])
		const finishTime = data.startTime + voucher.expireHour * 1000 * 60 * 60
		const newMemberVouchers = await this.memberVoucherModel.create(
			members.map(member => ({
				member: member.member,
				voucher: voucher._id,
				startTime: data.startTime,
				finishTime: finishTime,
			})),
			session ? { session } : {}
		)
		return {
			members,
			newMemberVouchers,
		}
	}
}
