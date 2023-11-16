import { FileService } from '@app/common'
import {
	AccountAdmin,
	AccountAdminSchema,
	MongoSessionService,
	Shipper,
	ShipperSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ShipperController } from './shipper.controller'
import { ShipperService } from './shipper.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Shipper.name, schema: ShipperSchema },
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
		]),
	],
	controllers: [ShipperController],
	providers: [ShipperService, FileService, MongoSessionService],
})
export class ShipperModule {}
