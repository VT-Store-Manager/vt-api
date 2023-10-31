import {
	AccountSale,
	AccountSaleSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AccountSale.name, schema: AccountSaleSchema },
			{ name: Store.name, schema: StoreSchema },
		]),
	],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
