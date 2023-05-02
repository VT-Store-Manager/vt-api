import { isNumber } from 'lodash'
import { Document, Types } from 'mongoose'

import {
	OrderBuyer,
	OrderState,
	PaymentType,
	ShippingMethod,
} from '@/common/constants'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { OrderInfoItem, OrderInfoItemSchema } from './order-info-item.schema'
import { OrderInfoStore, OrderInfoStoreSchema } from './order-info-store.schema'

export type OrderDocument = Order & Document

const generateOrderCode = (time = Date.now()) => {
	return Math.floor(time * (1 + Math.random()))
		.toString(36)
		.toUpperCase()
}

@Schema({
	versionKey: false,
	timestamps: { createdAt: true, updatedAt: false },
	discriminatorKey: 'buyer',
})
export class Order {
	_id?: Types.ObjectId

	@Prop({
		type: String,
		unique: true,
		default: function () {
			return 'O' + (this.type ?? '') + generateOrderCode()
		},
	})
	code?: string

	@Prop({
		type: Number,
		enum: {
			values: Object.values(ShippingMethod).filter(v => isNumber(v)),
			message: 'Buyer must be 0 (In store) or 1 (Pick up) or 2 (Delivery)',
		},
		required: true,
	})
	type: ShippingMethod

	@Prop({
		type: String,
		enum: Object.values(OrderBuyer),
		default: OrderBuyer.CUSTOMER,
		required: true,
	})
	buyer: string

	@Prop({ type: OrderInfoStoreSchema, required: true, _id: false })
	store: OrderInfoStore

	@Prop({
		type: [OrderInfoItemSchema],
		validate: (v: OrderInfoItem[]) => {
			if (!v || !Array.isArray(v))
				throw new Error('Order items must be an array')
			if (v.length === 0)
				throw new Error('Order items must not be an empty array')
			return true
		},
	})
	items: OrderInfoItem[]

	@Prop({ type: Number, required: true, min: 0 })
	totalProductPrice: number

	@Prop({ type: Number, default: 0, min: 0 })
	deliveryPrice?: number

	@Prop({ type: Number, default: 0, min: 0 })
	deliveryDiscount?: number

	@Prop({
		type: Number,
		enum: {
			values: Object.values(PaymentType).filter(v => isNumber(v)),
			message: 'Buyer must be 0 (Cast) or 1 (Momo)',
		},
		required: true,
	})
	payment: PaymentType

	@Prop({
		type: Number,
		min: 0,
		default: function () {
			return this.totalPrice
		},
	})
	paidAmount?: number

	@Prop({
		type: Number,
		enum: {
			values: Object.values(OrderState).filter(v => isNumber(v)),
			message:
				'Order state must be 0 (Processing) or 1 (Done) or 2 (Cancelled)',
		},
		default: OrderState.PROCESSING,
	})
	state?: OrderState = OrderState.PROCESSING

	// TODO: Implement order process
	process?: any[]
	createdAt?: Date
}

export const OrderSchema = SchemaFactory.createForClass(Order)
