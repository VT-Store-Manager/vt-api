/* eslint-disable no-case-declarations */
import { ChangeStreamUpdateDocument } from 'mongodb'
import { Model } from 'mongoose'
import { MemberRank, MemberRankDocument } from '@/schemas/member-rank.schema'
import { Rank, RankDocument } from '@/schemas/rank.schema'
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class MemberRankStream {
	constructor(
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>,
		@InjectModel(Rank.name)
		private readonly rankModel: Model<RankDocument>
	) {
		this.watch()
	}

	private watch() {
		const changeStream = this.memberRankModel.watch(
			[
				{
					$match: {
						operationType: 'update',
						$or: [
							{ 'updateDescription.updatedFields.currentPoint': { $ne: null } },
							{ 'updateDescription.updatedFields.usedPoint': { $ne: null } },
							{ 'updateDescription.updatedFields.expiredPoint': { $ne: null } },
						],
					},
				},
				{
					$project: {
						updateDescription: true,
						fullDocument: {
							member: true,
							rank: true,
							totalPoint: {
								$sum: [
									'$fullDocument.currentPoint',
									'$fullDocument.expiredPoint',
									'$fullDocument.usedPoint',
								],
							},
						},
					},
				},
			],
			{
				fullDocument: 'whenAvailable',
			}
		)

		changeStream.on(
			'change',
			(
				data: ChangeStreamUpdateDocument<MemberRank & { totalPoint: number }>
			) => {
				this.updateMemberRankTrigger(data.fullDocument)
			}
		)
	}

	private async updateMemberRankTrigger(
		postData: Pick<MemberRank, 'member' | 'rank'> & { totalPoint: number }
	) {
		const [nextRank, currentRank] = await Promise.all([
			this.rankModel
				.findOne({
					minPoint: {
						$lte: postData.totalPoint >= 0 ? postData.totalPoint : 0,
					},
				})
				.sort('-minPoint')
				.limit(1)
				.select('_id name')
				.lean()
				.exec(),
			this.rankModel.findById(postData.rank).select('name').lean().exec(),
		])

		if (!nextRank) return

		if (nextRank._id.toString() === currentRank._id.toString()) return

		await this.memberRankModel.updateOne(
			{
				member: postData.member,
			},
			{
				rank: nextRank._id,
			}
		)
		Logger.verbose(
			`Member ${postData.member.toString()}: Rank ${currentRank.name} -> ${
				nextRank.name
			}`,
			'UpdateMemberRankTrigger'
		)
	}
}
