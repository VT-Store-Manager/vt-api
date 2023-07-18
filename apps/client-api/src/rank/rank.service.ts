import { Model } from 'mongoose'

import { Rank, RankDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class RankService {
	constructor(
		@InjectModel(Rank.name) private readonly rankModel: Model<RankDocument>
	) {}
}
