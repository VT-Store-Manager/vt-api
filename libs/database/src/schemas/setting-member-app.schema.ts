import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
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
			voucher: String,
		},
		_id: false,
	})
	defaultImages: {
		product: string
		store: string
		voucher: string
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
			limit: { type: Number, default: 10 },
		},
		default: () => ({}),
		_id: false,
	})
	cartTemplate: {
		limit: number
	}

	@Prop({
		type: {
			main: {
				type: [
					{
						name: { type: String, required: true, minlength: 1 },
						icon: {
							type: String,
							required: true,
							minlength: 1,
							validate: (v: string) => {
								const pattern =
									/^[a-z]+(-[a-z]+){0,}( [a-z]+(-[a-z]+){0,}){0,}$/
								if (pattern.test(v)) return true
								throw new Error('Icon classes is invalid')
							},
						},
					},
				],
			},
			other: {
				type: {
					icon: {
						type: String,
						required: true,
						minlength: 1,
						validate: (v: string) => {
							const pattern = /^[a-z]+(-[a-z]+){0,}( [a-z]+(-[a-z]+){0,}){0,}$/
							if (pattern.test(v)) return true
							throw new Error('Icon classes is invalid')
						},
					},
					limit: { type: Number, min: 1 },
					_id: false,
				},
			},
			_id: false,
		},
	})
	address: {
		main: {
			_id?: Types.ObjectId | string
			name: string
			icon: string
		}[]
		other: {
			icon: string
			limit: number
		}
	}

	@Prop({
		type: {
			order: {
				type: {
					name: { type: String },
					description: { type: String },
					image: { type: String },
				},
				_id: false,
			},
			limit: { type: Number, validate: (v: number) => v >= 10 },
			_id: false,
		},
	})
	notification: {
		order: {
			name: string
			description: string
			image: string
		}
		defaultImage: string
		limit: number
	}
}

export const SettingMemberAppSchema =
	SchemaFactory.createForClass(SettingMemberApp)
