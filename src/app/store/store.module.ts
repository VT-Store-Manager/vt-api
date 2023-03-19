import { MongoService } from '@/common/providers/mongo.service'
import { Store, StoreSchema } from '@/schemas/store.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterModule } from '../counter/counter.module'
import { FileService } from '../file/file.service'
import { StoreController } from './store.controller'
import { StoreService } from './store.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
		CounterModule,
	],
	controllers: [StoreController],
	providers: [StoreService, FileService, MongoService],
})
export class StoreModule {}
