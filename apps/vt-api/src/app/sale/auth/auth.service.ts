import { Model, Types } from 'mongoose'

import { HashService } from '@app/common'
import {
	AccountSale,
	AccountSaleDocument,
	Store,
	StoreDocument,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { LoginDTO } from './dto/login.dto'

@Injectable()
export class AuthService {
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
