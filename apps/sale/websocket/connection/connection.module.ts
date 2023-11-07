import { CommonAuthModule } from '@app/authentication'
import {
	AccountAdmin,
	AccountAdminSchema,
	Member,
	MemberSchema,
	Shipper,
	ShipperSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ConnectionGateway } from './connection.gateway'
import { WsConnectionService } from './connection.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: Shipper.name, schema: ShipperSchema },
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
		]),
		CommonAuthModule,
	],
	providers: [ConnectionGateway, WsConnectionService],
	exports: [WsConnectionService],
})
export class ConnectionModule {}
