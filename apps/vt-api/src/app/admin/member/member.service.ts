import { Member, MemberDocument } from '@/database/schemas/member.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { GetMemberListPaginationDTO } from './dto/get-member-list-pagination.dto'
import { MemberItemDTO, MemberListPaginationDTO } from './dto/response.dto'

@Injectable()
export class MemberService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>
	) {}

	async getListPagination(
		query: GetMemberListPaginationDTO
	): Promise<MemberListPaginationDTO> {
		const [totalCount, productList] = await Promise.all([
			this.memberModel.count().exec(),
			this.memberModel
				.aggregate<MemberItemDTO>([
					{
						$skip: (query.page - 1) * query.limit,
					},
					{
						$limit: query.limit,
					},
					{
						$project: {
							id: '$_id',
							_id: false,
							name: {
								$concat: ['$firstName', ' ', '$lastName'],
							},
							gender: true,
							phone: true,
							createdAt: {
								$toLong: '$createdAt',
							},
						},
					},
					{
						$lookup: {
							from: 'member_ranks',
							localField: 'id',
							foreignField: 'member',
							as: 'rank',
							pipeline: [
								{
									$lookup: {
										from: 'ranks',
										localField: 'rank',
										foreignField: '_id',
										as: 'info',
										pipeline: [
											{
												$project: {
													id: '$_id',
													_id: false,
													name: true,
													rank: true,
													appearance: true,
												},
											},
										],
									},
								},
								{
									$unwind: {
										path: '$info',
									},
								},
								{
									$project: {
										_id: false,
										code: true,
										info: true,
										currentPoint: true,
										usedPoint: true,
										expiredPoint: true,
									},
								},
							],
						},
					},
					{
						$unwind: {
							path: '$rank',
							preserveNullAndEmptyArrays: true,
						},
					},
				])
				.exec(),
		])
		return {
			totalCount,
			items: productList,
		}
	}
}
