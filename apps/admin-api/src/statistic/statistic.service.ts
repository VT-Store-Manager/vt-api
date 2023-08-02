import { Model } from 'mongoose'

import { ONE_DAY_DURATION } from '@app/common'
import { Member, MemberDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { GetUserAmountDTO } from './dto/get-user-amount.dto'

@Injectable()
export class StatisticService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>
	) {}

	private getToday() {
		const date = new Date()
		return new Date(date.getFullYear(), date.getMonth(), date.getDate())
	}

	async getMemberAmount(query: GetUserAmountDTO) {
		const members = await this.memberModel
			.aggregate<{
				deleted: boolean
				deletedAt?: Date
				createdAt: Date
			}>([
				{
					$match: {
						notVerified: null,
					},
				},
				{
					$project: {
						_id: false,
						deleted: true,
						deletedAt: true,
						createdAt: true,
					},
				},
			])
			.exec()

		const startDuration =
			this.getToday().getTime() - query.duration * ONE_DAY_DURATION

		const increasing = members.filter(member => {
			return new Date(member.createdAt).getTime() >= startDuration
		}).length

		const decreasing = members.filter(member => {
			return (
				member.deleted &&
				member.deletedAt &&
				new Date(member.deletedAt).getTime() >= startDuration
			)
		}).length

		return {
			count: members.length,
			increasing,
			decreasing,
		}
	}
}
