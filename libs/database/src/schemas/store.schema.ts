import { Document, Types } from 'mongoose'
import mongooseDelete from 'mongoose-delete'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

import { validateVnPhoneNumber } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type StoreDocument = Store &
	Document & {
		fullAddress: string
	}

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

export class UnavailableGoods {
	product: Array<Types.ObjectId | string>
	category: Array<Types.ObjectId | string>
	option: Array<Types.ObjectId | string>
}

export const UnavailableGoodsSchema = {
	product: {
		type: [Types.ObjectId],
		default: [],
		ref: 'Product',
		set: (v: string[]) => v.map(id => new Types.ObjectId(id)),
	},
	category: {
		type: [Types.ObjectId],
		default: [],
		ref: 'ProductCategory',
		set: (v: string[]) => v.map(id => new Types.ObjectId(id)),
	},
	option: {
		type: [Types.ObjectId],
		default: [],
		ref: 'ProductOption',
		set: (v: string[]) => v.map(id => new Types.ObjectId(id)),
	},
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
		type: String,
		required: true,
		validate: validateVnPhoneNumber,
	})
	phone: string

	@Prop({
		type: AddressSchema,
		_id: false,
		required: true,
	})
	address: Address

	@Prop({ type: Number, default: 0 })
	lat?: number

	@Prop({ type: Number, default: 0 })
	lng?: number

	@Prop({
		type: UnavailableGoodsSchema,
		_id: false,
		default: { product: [], category: [], option: [] },
	})
	unavailableGoods: UnavailableGoods

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
	overrideMethods: 'all',
})

StoreSchema.virtual('fullAddress').get(function () {
	const { street, ward, district, city, country } = this.address
	return [street, ward, district, city, country]
		.filter(value => !!value)
		.join(', ')
})
