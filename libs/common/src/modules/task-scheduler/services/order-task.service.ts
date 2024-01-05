import { Model, Types } from 'mongoose'

import { Order, OrderDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SchedulerRegistry } from '@nestjs/schedule'
import { OrderDataDTO } from '@websocket/order/dto/order-data.dto'

import { OrderState, TaskKey } from '../../../constants'
import { TaskScheduleLogger } from '../../../helpers'

@Injectable()
export class OrderTaskService {
	constructor(
		private readonly schedulerRegistry: SchedulerRegistry,
		@InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>
	) {}

	async cancelTimeoutOrder(orderId: string, cb?: (orderData: Order) => any) {
		const cancelledData = await this.orderModel
			.updateOne(
				{ _id: new Types.ObjectId(orderId) },
				{ $set: { state: OrderState.CANCELED } },
				{ new: true }
			)
			.lean()
			.exec()

		if (typeof cb === 'function') cb(cancelledData)
	}

	removeCancelOrderTimeout(body: OrderDataDTO) {
		const timeoutName = TaskKey.CANCEL_ORDER_PREFIX + body.orderId
		this.schedulerRegistry.deleteTimeout(timeoutName)

		TaskScheduleLogger.verbose(`Timeout of order ${body.orderId} was cancelled`)
	}

	addCancelOrderTimeout(
		body: OrderDataDTO,
		callback: () => void,
		durationInMinute: number
	) {
		const timeout = setTimeout(callback, durationInMinute * 60 * 1000)
		const timeoutName = TaskKey.CANCEL_ORDER_PREFIX + body.orderId
		this.schedulerRegistry.addTimeout(timeoutName, timeout)

		TaskScheduleLogger.verbose(
			`Order ${body.orderId} will be cancelled in next ${durationInMinute} minutes`
		)
	}
}
