import {
	AccountSale,
	AccountSaleSchema,
} from '@/database/schemas/account-sale.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AccountSaleService } from './account.service'
import { AccountSaleController } from './account.controller'
import { HashService } from '@/common/providers/hash.service'
import { TokenService } from '@/app/authentication/services/token.service'
import {
	RefreshToken,
	RefreshTokenSchema,
} from '@/database/schemas/refresh-token.schema'
import { JwtService } from '@nestjs/jwt'
import { Store, StoreSchema } from '@/database/schemas/store.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AccountSale.name, schema: AccountSaleSchema },
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
			{ name: Store.name, schema: StoreSchema },
		]),
	],
	controllers: [AccountSaleController],
	providers: [AccountSaleService, HashService, TokenService, JwtService],
})
export class AccountSaleModule {}
