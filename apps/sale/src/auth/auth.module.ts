import { JwtAccessStrategy, TokenService } from '@app/authentication'
import {
	AccountAdmin,
	AccountAdminSchema,
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
import { AuthService as CommonAuthService } from '@app/authentication'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AccountSale.name, schema: AccountSaleSchema },
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: Member.name, schema: MemberSchema },
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
		]),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		TokenService,
		JwtService,
		JwtAccessStrategy,
		CommonAuthService,
	],
})
export class AuthModule {}
