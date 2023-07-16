import { ClientSession, Model } from 'mongoose'

import { Partner, PartnerDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreatePartnerDTO } from './dto/create_partner.dto'

@Injectable()
export class PartnerService {
	constructor(
		@InjectModel(Partner.name)
		private readonly partnerModel: Model<PartnerDocument>
	) {}

	async create(data: CreatePartnerDTO, session?: ClientSession) {
		const createdPartner = await this.partnerModel.create(
			[
				{
					...data,
				},
			],
			session ? { session } : {}
		)
		return createdPartner
	}
}
