import { FileService } from '@app/common'
import { MongoSessionService, Partner, PartnerSchema } from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { PartnerController } from './partner.controller'
import { PartnerService } from './partner.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Partner.name, schema: PartnerSchema }]),
	],
	controllers: [PartnerController],
	providers: [PartnerService, FileService, MongoSessionService],
})
export class PartnerModule {}
