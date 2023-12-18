import { AdminRequest, AdminRequestSchema } from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminRequestService } from './admin-request.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AdminRequest.name, schema: AdminRequestSchema },
		]),
	],
	providers: [AdminRequestService],
	exports: [AdminRequestService, MongooseModule],
})
export class AdminRequestModule {}
