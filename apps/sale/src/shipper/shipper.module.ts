import {
	AuthService,
	JwtAccessStrategy,
	JwtRefreshStrategy,
	SmsService,
	TokenService,
} from '@app/authentication'
import {
	AccountAdmin,
	AccountAdminSchema,
	Member,
	MemberSchema,
	MongoSessionService,
	Order,
	OrderSchema,
	RefreshToken,
	RefreshTokenSchema,
	Shipper,
	ShipperSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { ShipperAuthController } from './controllers/auth.controller'
import { ShipperOrderController } from './controllers/order.controller'
import { ShipperAuthService } from './services/auth.service'
import { ShipperOrderService } from './services/order.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Shipper.name, schema: ShipperSchema },
			{ name: Order.name, schema: OrderSchema },
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
			{ name: Member.name, schema: MemberSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
		]),
	],
	controllers: [ShipperAuthController, ShipperOrderController],
	providers: [
		SmsService,
		ShipperAuthService,
		ShipperOrderService,
		AuthService,
		TokenService,
		MongoSessionService,
		JwtService,
		JwtAccessStrategy,
		JwtRefreshStrategy,
	],
})
export class ShipperModule {}
