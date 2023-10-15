import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

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
}

export const OrderInfoShipperSchema =
	SchemaFactory.createForClass(OrderInfoShipper)
