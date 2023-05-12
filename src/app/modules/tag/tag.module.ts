import { Tag, TagSchema } from '@/database/schemas/tag.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { TagAdminController } from './admin-app/tag_admin.controller'
import { TagAdminService } from './admin-app/tag_admin.service'

@Module({
	imports: [MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }])],
	controllers: [TagAdminController],
	providers: [TagAdminService],
})
export class TagModule {}
