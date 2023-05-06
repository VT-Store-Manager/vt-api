import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { OrderStatus, SettingType } from '@/common/constants'

export type SettingMemberAppDocument = Document & SettingMemberApp

export class BookingOrderStatus {
	status: OrderStatus
	name: string
	description?: string
}

export const bookingOrderStatusSchema = {
	status: {
		type: String,
		enum: Object.values(OrderStatus),
		required: true,
	},
	name: { type: String, required: true },
	description: { type: String },
}

@Schema({
	versionKey: false,
})
export class SettingMemberApp {
	type: SettingType

	@Prop({ type: String })
	appName: string

	@Prop({
		type: {
			pointName: { type: String },
			startMilestone: { type: Number, min: 1 },
			pointPerUnit: { type: Number, min: 1 },
			unitStep: { type: Number, min: 1 },
		},
		_id: false,
	})
	point: {
		pointName: string
		startMilestone: number
		pointPerUnit: number
		unitStep: number
	}

	@Prop({
		type: {
			image: { type: String },
			content: { type: String, required: true },
		},
		_id: false,
	})
	greeting: {
		image: string
		content: string
	}

	@Prop({
		type: {
			product: String,
			store: String,
			category: String,
			coupon: String,
			couponNotification: String,
		},
		_id: false,
	})
	defaultImages: {
		product: string
		store: string
		category: string
		coupon: string
		couponNotification: string
	}

	@Prop({
		type: {
			defaultDisplay: {
				type: {
					icon: String,
					color: String,
					background: String,
				},
				_id: false,
			},
		},
		_id: false,
	})
	memberRank: {
		defaultDisplay: {
			icon: string
			color: string
			background: string
		}
	}

	@Prop({
		type: {
			pickupStatus: {
				type: [bookingOrderStatusSchema],
				_id: false,
			},
			deliveryStatus: {
				type: [bookingOrderStatusSchema],
				_id: false,
			},
			onPremiseStatus: {
				type: [bookingOrderStatusSchema],
				_id: false,
			},
		},
		_id: false,
	})
	order: {
		deliveryStatus: Array<BookingOrderStatus>
		pickupStatus: Array<BookingOrderStatus>
		onPremiseStatus: Array<BookingOrderStatus>
	}

	@Prop({
		type: {
			cartTemplate: { type: Number, default: 10 },
		},
		default: () => ({}),
	})
	limit: {
		cartTemplate: number
	}
}

export const SettingMemberAppSchema =
	SchemaFactory.createForClass(SettingMemberApp)
