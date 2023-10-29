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
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { MemberConnectionGateway } from './connection.gateway'
import { AuthService, JwtAccessStrategy } from '@/libs/authentication/src'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Member.name, schema: MemberSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: Shipper.name, schema: ShipperSchema },
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
		]),
	],
	providers: [
		MemberConnectionGateway,
		JwtService,
		JwtAccessStrategy,
		AuthService,
	],
})
export class MemberConnectionModule {}
