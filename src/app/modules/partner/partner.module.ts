import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Partner, PartnerSchema } from '@schema/partner.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { FileService } from '../file/file.service'
import { PartnerAdminController } from './admin-app/partner_admin.controller'
import { PartnerAdminService } from './admin-app/partner_admin.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Partner.name, schema: PartnerSchema }]),
	],
	controllers: [PartnerAdminController],
	providers: [PartnerAdminService, FileService, MongoSessionService],
})
export class PartnerModule {}
