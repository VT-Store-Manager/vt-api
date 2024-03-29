import { Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'

import { Gender, validateVnPhoneNumber } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { isNumber } from 'lodash'
import { UpdatedBy, UpdatedBySchema } from './updated-by.schema'

export type ShipperDocument = Shipper & Document & SoftDeleteDocument

@Schema({ versionKey: false, timestamps: true })
export class Shipper {
	_id?: Types.ObjectId

	@Prop({
		type: String,
		required: true,
		unique: true,
		validate: validateVnPhoneNumber,
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

	@Prop({ type: String, required: true, unique: true })
	numberPlate: string

	@Prop({ type: Number, min: 0, default: 0 })
	wallet: number

	@Prop({ type: UpdatedBySchema, required: true })
	updatedBy: UpdatedBy

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
