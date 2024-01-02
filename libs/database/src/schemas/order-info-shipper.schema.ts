import { Types } from 'mongoose'

import { s3KeyPattern } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class ShipperReview {
	@Prop({
		type: Number,
		required: true,
		min: 1,
		max: 5,
		set: (v: number) => +(v * 2).toFixed(0) / 2,
	})
	rate: number

	@Prop({ type: String, default: '' })
	content?: string
}

export const ShipperReviewSchema = SchemaFactory.createForClass(ShipperReview)

@Schema({ versionKey: false, _id: false })
export class OrderInfoShipper {
	@Prop({ type: Types.ObjectId, ref: 'Shipper' })
	id: Types.ObjectId

	@Prop({ type: String, required: true })
	phone: string

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: ShipperReviewSchema })
	review?: ShipperReview

	@Prop({ type: String, match: s3KeyPattern })
	shippedEvidence?: string

	@Prop({ type: Number, min: 0 })
	shipperIncome?: number

	@Prop({ type: Number, min: 0 })
	deliveryDistance?: number
}

export const OrderInfoShipperSchema =
	SchemaFactory.createForClass(OrderInfoShipper)
