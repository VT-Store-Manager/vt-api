/* eslint-disable no-case-declarations */
import { ChangeStreamUpdateDocument } from 'mongodb'
import { Model } from 'mongoose'

import { ChangeStreamLogger } from '@app/common'
import {
	MemberRank,
	MemberRankDocument,
	Rank,
	RankDocument,
} from '@app/database'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class MemberRankStreamService implements OnModuleInit {
	constructor(
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>,
		@InjectModel(Rank.name)
		private readonly rankModel: Model<RankDocument>
	) {}

	onModuleInit() {
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

		ChangeStreamLogger.debug('Member rank stream watching...')
		changeStream.on(
			'change',
			(
				data: ChangeStreamUpdateDocument<MemberRank & { totalPoint: number }>
			) => {
				if (!data.fullDocument) return
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
		ChangeStreamLogger.verbose(
			`Member ${postData.member.toString()}: Rank ${currentRank.name} -> ${
				nextRank.name
			}`
		)
	}
}
