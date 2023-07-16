import { difference } from 'lodash'
import { ClientSession, Model, Types } from 'mongoose'

import {
	MemberRank,
	MemberRankDocument,
	MemberVoucher,
	MemberVoucherDocument,
	Voucher,
	VoucherDocument,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { AssignVoucherDTO } from './dto/create-member-voucher.dto'
import { CreateMemberVoucherDTO, CreateResultItemDTO } from './dto/response.dto'

@Injectable()
export class MemberVoucherService {
	constructor(
		@InjectModel(Voucher.name)
		private readonly voucherModel: Model<VoucherDocument>,
		@InjectModel(MemberVoucher.name)
		private readonly memberVoucherModel: Model<MemberVoucherDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>
	) {}

	async createMemberVoucher(
		data: AssignVoucherDTO,
		session?: ClientSession
	): Promise<CreateMemberVoucherDTO> {
		const targetObjectIds = data.targets.map(id => new Types.ObjectId(id))
		const [members, vouchers] = await Promise.all([
			this.memberRankModel
				.aggregate<{
					member: string
					rank: string
				}>([
					{
						$match:
							targetObjectIds.length > 0
								? {
										$or: [
											{ member: { $in: targetObjectIds } },
											{ rank: { $in: targetObjectIds } },
											{ code: { $in: targetObjectIds } },
										],
								  }
								: {},
					},
					{
						$lookup: {
							from: 'ranks',
							localField: 'rank',
							foreignField: '_id',
							as: 'rank',
						},
					},
					{
						$unwind: {
							path: '$rank',
						},
					},
					{
						$project: {
							_id: false,
							member: {
								$toString: '$member',
							},
							rank: true,
						},
					},
				])
				.exec(),
			this.voucherModel
				.find({ _id: data.vouchers.map(id => new Types.ObjectId(id)) })
				.orFail(new BadRequestException('Voucher not found'))
				.select('expireHour')
				.lean()
				.exec(),
		])

		const memberMap = new Map(members.map(member => [member.member, member]))

		const createResult: CreateResultItemDTO[] = []
		for (const voucher of vouchers) {
			const finishTime = data.startTime + voucher.expireHour * 1000 * 60 * 60
			const result: CreateResultItemDTO = {
				voucher: voucher._id.toString(),
				failedList: [],
			}
			const newMemberVouchers = await this.memberVoucherModel.create(
				members.map(member => ({
					member: new Types.ObjectId(member.member),
					voucher: voucher._id,
					startTime: data.startTime,
					finishTime: finishTime,
				})),
				session ? { session } : {}
			)

			const failedMembers = difference(
				members.map(memberRank => memberRank.member.toString()),
				newMemberVouchers.map(memberVoucher => memberVoucher.member.toString())
			)

			const failedRanks = failedMembers.reduce((res, memberId) => {
				const memberRank = memberMap.get(memberId).rank
				if (!Array.isArray(res[memberRank])) {
					res[memberRank] = []
				}
				res[memberRank].push(memberId)

				return res
			}, {}) as Record<string, string[]>

			result.failedList = Object.keys(failedRanks).map(rank => ({
				rank: rank,
				members: failedRanks[rank],
			}))

			createResult.push(result)
		}

		return {
			totalCount: members.length,
			result: createResult,
		}
	}
}
