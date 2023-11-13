import { SoftDeleteModel } from 'mongoose-delete'

import {
	AccountSale,
	AccountSaleDocument,
	Store,
	StoreDocument,
} from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import {
	AccountSaleListItem,
	AccountSaleListPagination,
} from './dto/response.dto'
import { QueryAccountSaleListDTO } from './dto/query-account-sale-list.dto'

@Injectable()
export class AccountSaleService {
	constructor(
		@InjectModel(AccountSale.name)
		private readonly accountSaleModel: SoftDeleteModel<AccountSaleDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: SoftDeleteModel<StoreDocument>
	) {}

	async getAccountSaleList(
		query: QueryAccountSaleListDTO
	): Promise<AccountSaleListPagination> {
		const [allAccountList, accountList] = await Promise.all([
			this.storeModel
				.aggregate<{ accounts: any[] }>([
					{
						$lookup: {
							from: 'account_sales',
							localField: '_id',
							foreignField: 'store',
							as: 'accounts',
							pipeline: [
								{
									$match: {
										deleted: { $ne: true },
									},
								},
								{
									$project: {
										_id: true,
									},
								},
							],
						},
					},
					{
						$project: {
							accounts: true,
						},
					},
				])
				.exec(),
			this.accountSaleModel
				.aggregate<AccountSaleListItem>([
					{
						$lookup: {
							from: 'stores',
							localField: 'store',
							foreignField: '_id',
							as: 'store',
							pipeline: [
								{
									$match: {
										deleted: { $ne: true },
									},
								},
							],
						},
					},
					{
						$unwind: {
							path: '$store',
						},
					},
					{
						$project: {
							id: {
								$toString: '$_id',
							},
							_id: false,
							username: true,
							store: {
								id: {
									$toString: '$store._id',
								},
								name: '$store.name',
								image: {
									$first: '$store.images',
								},
							},
							updatedBy: { $ifNull: ['$updatedBy', null] },
							createdAt: true,
							updatedAt: true,
						},
					},
					...(query.sortBy
						? [
								{
									$sort: {
										[query.sortBy.replace(/^(-|\+)+/, '')]:
											query.sortBy.startsWith('-') ? -1 : 1,
									},
								} as any,
						  ]
						: []),
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
			totalCount: allAccountList.reduce(
				(sum, store) => sum + store.accounts.length,
				0
			),
			items: accountList,
		}
	}
}
