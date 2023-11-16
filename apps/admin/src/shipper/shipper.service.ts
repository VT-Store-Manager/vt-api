import { ClientSession, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Shipper, ShipperDocument, UpdatedBy } from '@app/database'
import { SoftDeleteModel } from 'mongoose-delete'
import { CreateShipperDTO } from './dto/create-shipper.dto'
import { QueryShipperListDTO } from './dto/query-shipper-list.dto'
import { ShipperListItem, ShipperListPagination } from './dto/response.dto'
import { isEmpty } from 'lodash'

@Injectable()
export class ShipperService {
	constructor(
		@InjectModel(Shipper.name)
		private readonly shipperModel: SoftDeleteModel<ShipperDocument>
	) {}

	async createShipper(
		data: CreateShipperDTO,
		updatedBy: UpdatedBy,
		session?: ClientSession
	): Promise<Shipper> {
		const [shipper] = await this.shipperModel.create(
			[
				{
					...data,
					avatar: typeof data.avatar === 'string' ? data.avatar : '',
					dob: new Date(data.dob),
					updatedBy,
				},
			],
			session ? { session } : {}
		)

		return shipper
	}

	async getShipperListPagination(
		query: QueryShipperListDTO
	): Promise<ShipperListPagination> {
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

		const [countShippers, shippers] = await Promise.all([
			this.shipperModel.count().exec(),
			this.shipperModel
				.aggregate<ShipperListItem>([
					{
						$addFields: {
							id: '$_id',
						},
					},
					{
						$project: {
							_id: false,
							deleted: false,
							deletedAt: false,
							deletedBy: false,
						},
					},
					...(isEmpty(sortKeys)
						? []
						: [
								{
									$sort: sortKeys,
								},
						  ]),
					{
						$skip: (query.page - 1) * query.limit,
					},
					{
						$limit: query.limit,
					},
				])
				.exec(),
		])

		return {
			totalCount: countShippers,
			items: shippers,
		}
	}

	async deleteShipper(deleteId: string, adminId: string): Promise<boolean> {
		const deleteResult = await this.shipperModel
			.delete(
				{ _id: new Types.ObjectId(deleteId) },
				new Types.ObjectId(adminId)
			)
			.exec()

		return deleteResult.deletedCount > 0
	}
}
