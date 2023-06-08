import { FileService } from '@/app/modules/file/file.service'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Partner, PartnerSchema } from '@schema/partner.schema'

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
