import { Counter, CounterSchema } from '@schema/counter.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterService } from './counter.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
	],
	providers: [CounterService],
	exports: [CounterService, MongooseModule],
})
export class CounterModule {}
