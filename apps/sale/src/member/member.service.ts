import { FilterQuery, Model } from 'mongoose'

import {
	Member,
	MemberRank,
	MemberRankDocument,
	MemberDocument,
} from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SearchMemberDTO } from './dto/search-member.dto'
import { SearchResultItemDTO } from './dto/response.dto'
import { uniqBy } from 'lodash'

@Injectable()
export class MemberService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		@InjectModel(MemberRank.name)
		private readonly memberRankModel: Model<MemberRankDocument>
	) {}

	async searchMember(query: SearchMemberDTO) {
		const filterQueries: FilterQuery<MemberDocument>[] = [
			{ code: query.keyword },
			{ 'member.phone': new RegExp(`${query.keyword}`) },
			{ 'member.firstName': new RegExp(`${query.keyword}`) },
			{ 'member.lastName': new RegExp(`${query.keyword}`) },
		]

		const members = await Promise.all(
			filterQueries.map(query => {
				return this.memberRankModel
					.aggregate<SearchResultItemDTO>([
						{
							$lookup: {
								from: 'members',
								localField: 'member',
								foreignField: '_id',
								as: 'member',
							},
						},
						{
							$unwind: {
								path: '$member',
							},
						},
						{
							$match: query,
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
								id: {
									$toString: '$member._id',
								},
								name: {
									$concat: ['$member.firstName', ' ', '$member.lastName'],
								},
								phone: '$member.phone',
								code: true,
								currentPoint: true,
								rankName: '$rank.name',
								rankColor: '$rank.appearance.color',
							},
						},
					])
					.exec()
			})
		)

		const result = members.reduce((res, cur) => {
			return uniqBy([...res, ...cur], 'id')
		}, [])

		return result
	}
}
