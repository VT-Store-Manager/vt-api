import {
	AccountSale,
	AccountSaleDocument,
} from '@/database/schemas/account-sale.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { LoginDTO } from './dto/login.dto'
import { InjectModel } from '@nestjs/mongoose'
import { HashService } from '@/common/providers/hash.service'
import { Store, StoreDocument } from '@/database/schemas/store.schema'

@Injectable()
export class AccountSaleService {
	constructor(
		@InjectModel(AccountSale.name)
		private readonly accountSaleModel: Model<AccountSaleDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: Model<StoreDocument>,
		private readonly hashService: HashService
	) {}

	async validateAccount({ username, password }: LoginDTO) {
		const account = await this.accountSaleModel
			.findOne({ username })
			.lean()
			.exec()
		if (!account) {
			throw new BadRequestException('Account not found')
		}

		if (!this.hashService.compare(password, account.password)) {
			throw new BadRequestException('Username or password is incorrect')
		}
		return account
	}

	async getStore(storeId: string) {
		return await this.storeModel
			.findOne({ _id: new Types.ObjectId(storeId) })
			.lean()
			.exec()
	}
}
