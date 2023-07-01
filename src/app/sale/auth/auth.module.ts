import {
	AccountSale,
	AccountSaleSchema,
} from '@/database/schemas/account-sale.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { HashService } from '@/common/providers/hash.service'
import { TokenService } from '@/app/authentication/services/token.service'
import {
	RefreshToken,
	RefreshTokenSchema,
} from '@/database/schemas/refresh-token.schema'
import { JwtService } from '@nestjs/jwt'
import { Store, StoreSchema } from '@/database/schemas/store.schema'
import { JwtAccessStrategy } from '@/app/authentication/strategies/jwt-access.strategy'
import { Member, MemberSchema } from '@/database/schemas/member.schema'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AccountSale.name, schema: AccountSaleSchema },
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: Member.name, schema: MemberSchema },
		]),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		HashService,
		TokenService,
		JwtService,
		JwtAccessStrategy,
	],
})
export class AuthModule {}
