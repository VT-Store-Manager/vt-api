import { isEmpty } from 'lodash'
import { ClientSession, Types } from 'mongoose'
import { SoftDeleteModel } from 'mongoose-delete'

import { Partner, PartnerDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreatePartnerDTO } from './dto/create_partner.dto'
import { QueryPartnerListDTO } from './dto/query-partner-list.dto'
import {
	PartnerListItemDTO,
	PartnerListPaginationDTO,
} from './dto/response.dto'

@Injectable()
export class PartnerService {
	constructor(
		@InjectModel(Partner.name)
		private readonly partnerModel: SoftDeleteModel<PartnerDocument>
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

	async getPartnerList(
		query: QueryPartnerListDTO
	): Promise<PartnerListPaginationDTO> {
		const sortKeys = (query.sortBy || '')
			.split(' ')
			.filter(key => /^(-|\+)?\w+(.\w+){0,}$/.test(key))
			.reduce((sortObj, key) => {
				let sortOrder = 1
				if (key.startsWith('-')) {
					sortOrder = -1
				}
				Object.assign(sortObj, {
					[key.replace(/^[-\+]+/, '')]: sortOrder,
				})
				return sortObj
			}, {})

		const [totalCount, partnerList] = await Promise.all([
			this.partnerModel.countDocuments().exec(),
			this.partnerModel
				.aggregate<PartnerListItemDTO>([
					{
						$addFields: {
							id: '$_id',
						},
					},
					{
						$project: {
							_id: false,
						},
					},
					...(isEmpty(sortKeys)
						? []
						: [
								{
									$sort: sortKeys,
								},
						  ]),
				])
				.exec(),
		])

		return {
			totalCount,
			items: partnerList,
		}
	}

	async deleteParter(partnerId: string, adminId: string) {
		const deleteResult = await this.partnerModel
			.delete(
				{
					_id: new Types.ObjectId(partnerId),
				},
				new Types.ObjectId(adminId)
			)
			.exec()

		return deleteResult.deletedCount > 0
	}
}
