import { Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'

import { Gender, vnPhoneNumberPattern } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { isNumber } from 'lodash'

export type ShipperDocument = Shipper & Document & SoftDeleteDocument

@Schema({ versionKey: false, timestamps: true })
export class Shipper {
	_id?: Types.ObjectId

	@Prop({
		type: String,
		required: true,
		unique: true,
		validate: (v: string) => {
			const check = vnPhoneNumberPattern.test(v)
			if (!check) throw new Error('Phone number is not valid')
			return true
		},
	})
	phone: string

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true })
	avatar: string

	@Prop({
		type: Number,
		enum: Object.values(Gender).filter(e => isNumber(e)),
		required: true,
	})
	gender: Gender

	@Prop({ type: Date, required: true })
	dob: Date

	deleted?: boolean
	deletedAt?: Date
	deletedBy?: Types.ObjectId
	createdAt?: Date
	updatedAt?: Date
}

export const ShipperSchema = SchemaFactory.createForClass(Shipper)

ShipperSchema.plugin(MongooseDelete, {
	deletedBy: true,
	deletedAt: true,
	overrideMethods: 'all',
})
