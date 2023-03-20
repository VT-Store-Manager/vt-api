import { Document, Types } from 'mongoose'
import mongooseDelete from 'mongoose-delete'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type StoreDocument = Store & Document

export class OpenTime {
	start: string
	end: string
}

export const OpenTimeSchema = {
	start: {
		type: String,
		default: '07:30',
		validate: {
			validator: (v: string) => new RegExp(/^[0-2][0-9]:[0-5][0-9]$/).test(v),
			message: 'Open time must be formatted hh:mm',
		},
	},
	end: {
		type: String,
		default: '21:30',
		validate: {
			validator: (v: string) => new RegExp(/^[0-2][0-9]:[0-5][0-9]$/).test(v),
			message: 'Open time must be formatted hh:mm',
		},
	},
}

export class Address {
	street: string
	ward?: string
	district: string
	city: string
	country: string
}

export const AddressSchema = {
	street: { type: String, required: true, index: 'text' },
	ward: { type: String, index: 'text' },
	district: { type: String, required: true, index: 'text' },
	city: { type: String, required: true, index: 'text' },
	country: { type: String, required: true, index: 'text' },
}

export class UnavailableKinds {
	product: Array<Types.ObjectId | string>
	category: Array<Types.ObjectId | string>
	option: Array<Types.ObjectId | string>
}

export const UnavailableKindsSchema = {
	product: { type: [Types.ObjectId], default: [], ref: 'Product' },
	category: { type: [Types.ObjectId], default: [], ref: 'ProductCategory' },
	option: { type: [Types.ObjectId], default: [], ref: 'ProductOption' },
}

@Schema({ versionKey: false, timestamps: true })
export class Store {
	_id: Types.ObjectId

	@Prop({ type: Number, required: true, unique: true })
	code: number

	@Prop({ type: String, required: true, index: 'text' })
	name: string

	@Prop([{ type: String }])
	images: Array<string>

	@Prop({
		type: OpenTimeSchema,
		_id: false,
		required: true,
	})
	openTime: OpenTime

	@Prop({
		type: AddressSchema,
		_id: false,
		required: true,
	})
	address: Address

	@Prop({
		type: UnavailableKindsSchema,
		_id: false,
		default: { product: [], category: [], option: [] },
	})
	unavailableKinds: UnavailableKinds

	@Prop({ type: Boolean, required: true, default: false })
	openedStatus: boolean

	@Prop({ type: Boolean, default: false })
	disabled: boolean

	createdAt?: Date
	updatedAt?: Date
	deleted?: boolean
	deletedAt?: Date
}

export const StoreSchema = SchemaFactory.createForClass(Store)

StoreSchema.plugin(mongooseLeanVirtuals)
StoreSchema.plugin(mongooseDelete, {
	deletedAt: true,
	indexFields: 'all',
})

StoreSchema.virtual('fullAddress').get(function () {
	const { street, ward, district, city, country } = this.address
	return [street, ward, district, city, country]
		.filter(value => !!value)
		.join(', ')
})
