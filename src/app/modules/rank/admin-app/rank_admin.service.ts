import { ClientSession, Model } from 'mongoose'

import { Rank, RankAppearance, RankDocument } from '@schema/rank.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { CreateRankDTO } from './dto/create-rank.dto'

@Injectable()
export class RankAdminService {
	constructor(
		@InjectModel(Rank.name) private readonly rankModel: Model<RankDocument>
	) {}

	private async getHighestRank() {
		return await this.rankModel.findOne().sort('-rank').lean().exec()
	}

	async createNewRank(
		appearance: RankAppearance,
		dto: CreateRankDTO,
		session?: ClientSession
	) {
		const highestRank = await this.getHighestRank()
		if (highestRank && highestRank.minPoint >= dto.minPoint) {
			throw new BadRequestException(
				`The min point must be greater than ${highestRank.minPoint}`
			)
		}
		const rank = highestRank ? highestRank.rank + 1 : 0
		const [newRank] = await this.rankModel.create(
			[
				{
					name: dto.name,
					rank,
					appearance,
					minPoint: dto.minPoint,
					coefficientPoint: dto.coefficientPoint || undefined,
				},
			],
			session ? { session } : {}
		)
		return newRank
	}
}
