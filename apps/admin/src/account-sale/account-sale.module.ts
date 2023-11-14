import {
	AccountAdmin,
	AccountAdminSchema,
	AccountSale,
	AccountSaleSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AccountSaleController } from './account-sale.controller'
import { AccountSaleService } from './account-sale.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AccountSale.name, schema: AccountSaleSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
		]),
	],
	controllers: [AccountSaleController],
	providers: [AccountSaleService],
})
export class AccountSaleModule {}
