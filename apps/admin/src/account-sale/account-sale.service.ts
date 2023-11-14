import { SoftDeleteModel } from 'mongoose-delete'

import {
	AccountAdmin,
	AccountAdminDocument,
	AccountSale,
	AccountSaleDocument,
	Store,
	StoreDocument,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import {
	AccountSaleListItem,
	AccountSaleListPagination,
	NewAccountSaleDTO,
} from './dto/response.dto'
import { QueryAccountSaleListDTO } from './dto/query-account-sale-list.dto'
import { CreateAccountSaleDTO } from './dto/create-account-sale.dto'
import { ClientSession, Types } from 'mongoose'
import { hash } from '@app/common'

@Injectable()
export class AccountSaleService {
	constructor(
		@InjectModel(AccountSale.name)
		private readonly accountSaleModel: SoftDeleteModel<AccountSaleDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: SoftDeleteModel<StoreDocument>,
		@InjectModel(AccountAdmin.name)
		private readonly accountAdminModel: SoftDeleteModel<AccountAdminDocument>
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

	async createAccount(
		data: CreateAccountSaleDTO,
		adminId: string,
		session?: ClientSession
	): Promise<NewAccountSaleDTO> {
		const defaultPassword = 'p@ssw0rd'

		const [_store, admin] = await Promise.all([
			this.storeModel
				.findOne({ _id: new Types.ObjectId(data.storeId) })
				.orFail(new BadRequestException('Store not found'))
				.select('_id')
				.lean()
				.exec(),
			this.accountAdminModel
				.findOne({ _id: new Types.ObjectId(adminId) })
				.orFail(new BadRequestException('Admin account not found'))
				.select('username')
				.lean()
				.exec(),
		])

		const [accountSale] = await this.accountSaleModel.create(
			[
				{
					username: data.username,
					password: hash(defaultPassword),
					store: new Types.ObjectId(data.storeId),
					updatedBy: {
						accountId: admin._id,
						accountUsername: admin.username,
						time: new Date(),
					},
				},
			],
			{ session }
		)

		accountSale.password = undefined

		return accountSale
	}

	async deleteAccount(deleteId: string, accountId: string) {
		const deleteResult = await this.accountSaleModel
			.delete(
				{ _id: new Types.ObjectId(deleteId) },
				new Types.ObjectId(accountId)
			)
			.exec()

		return deleteResult.deletedCount > 0
	}
}
