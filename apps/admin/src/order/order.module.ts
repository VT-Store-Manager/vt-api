import { Order, OrderSchema } from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { OrderController } from './order.controller'
import { OrderService } from './order.service'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
	],
	controllers: [OrderController],
	providers: [OrderService],
})
export class OrderModule {}
