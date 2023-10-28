import { Types } from 'mongoose'

import { validateVnPhoneNumber } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false })
export class MemberAddress {
	_id?: Types.ObjectId | string

	@Prop({
		type: String,
		default: function () {
			return (this as MemberAddress).address.split(',')[0].trim()
		},
	})
	name?: string

	@Prop({ type: String, required: true, minlength: 1 })
	address: string

	@Prop({ type: String, default: '' })
	building?: string

	@Prop({ type: String, default: '' })
	gate?: string

	@Prop({ type: String, default: '' })
	note?: string

	@Prop({
		type: [Number],
		validate: (v: number[]) => {
			if (!Array.isArray(v) || v.length !== 2) {
				throw new Error('Coordinate must be [latitude, longitude] format')
			}
			return true
		},
	})
	latLng?: [number, number]

	@Prop({ type: String, required: true, minlength: 1 })
	receiver: string

	@Prop({
		type: String,
		required: true,
		validate: validateVnPhoneNumber,
	})
	phone: string
}

export const MemberAddressSchema = SchemaFactory.createForClass(MemberAddress)
