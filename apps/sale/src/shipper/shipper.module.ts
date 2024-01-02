import { CommonAuthModule } from '@app/authentication'
import { AdminRequestModule, GoogleMapModule, SettingModule } from '@app/common'
import {
	MongoSessionService,
	Order,
	OrderSchema,
	Shipper,
	ShipperSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
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
		]),
		CommonAuthModule,
		SettingModule,
		AdminRequestModule,
		GoogleMapModule,
	],
	controllers: [ShipperAuthController, ShipperOrderController],
	providers: [ShipperAuthService, ShipperOrderService, MongoSessionService],
	exports: [ShipperOrderService, MongooseModule],
})
export class ShipperModule {}
