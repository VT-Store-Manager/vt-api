import { MongoService } from '@/common/providers/mongo.service'
import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { StoreService } from './store.service'

@ApiTags('store')
@Controller({
	path: 'store',
	version: '1',
})
export class StoreController {
	constructor(
		private readonly storeService: StoreService,
		private readonly fileService: StoreService,
		private readonly mongoService: MongoService
	) {}
}
