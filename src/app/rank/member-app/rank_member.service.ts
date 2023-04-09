import { Model } from 'mongoose'

import { Rank, RankDocument } from '@/schemas/rank.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class RankMemberService {
	constructor(
		@InjectModel(Rank.name) private readonly rankModel: Model<RankDocument>
	) {}
}
