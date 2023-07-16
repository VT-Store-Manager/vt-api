import { JwtAccessStrategy, TokenService } from '@app/authentication'
import { HashService } from '@app/common'
import {
	AccountSale,
	AccountSaleSchema,
	Member,
	MemberSchema,
	RefreshToken,
	RefreshTokenSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

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
