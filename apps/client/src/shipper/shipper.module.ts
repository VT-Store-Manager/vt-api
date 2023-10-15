import { Shipper, ShipperSchema } from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ShipperController } from './shipper.controller'
import { ShipperService } from './shipper.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Shipper.name, schema: ShipperSchema }]),
	],
	controllers: [ShipperController],
	providers: [ShipperService],
})
export class ShipperModule {}
