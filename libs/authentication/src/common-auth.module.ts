import { Global, Module } from '@nestjs/common'
import { JwtAccessStrategy } from './strategies/jwt-access.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'
import { AuthService } from './services/auth.service'
import { MongooseModule } from '@nestjs/mongoose'
import {
	AccountAdmin,
	AccountAdminSchema,
	Member,
	MemberSchema,
	RefreshToken,
	RefreshTokenSchema,
	Shipper,
	ShipperSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { TokenService } from './services/token.service'
import { SmsService } from './services/sms.service'

@Global()
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
			{ name: Shipper.name, schema: ShipperSchema },
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
		]),
		JwtModule.register({}),
	],
	providers: [
		JwtAccessStrategy,
		JwtRefreshStrategy,
		AuthService,
		TokenService,
		SmsService,
		JwtService,
	],
	exports: [
		JwtAccessStrategy,
		JwtRefreshStrategy,
		AuthService,
		TokenService,
		SmsService,
		JwtService,
	],
})
export class CommonAuthModule {}
