import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import MongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'

export type PartnerDocument = Partner & Document & SoftDeleteDocument

@Schema({ versionKey: false, timestamps: true })
export class Partner {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, unique: true })
	code: string

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true })
	image: string

	deleted?: boolean
	deletedAt?: Date
	deletedBy?: Types.ObjectId
	createdAt?: Date
	updatedAt?: Date
}

export const PartnerSchema = SchemaFactory.createForClass(Partner)

PartnerSchema.plugin(MongooseDelete, {
	deletedBy: true,
	deletedAt: true,
	overrideMethods: 'all',
})

@Schema({ versionKey: false, _id: false })
export class ShortPartner {
	@Prop({ type: Types.ObjectId, ref: 'Partner' })
	id?: Types.ObjectId

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true })
	image: string
}

export const ShortPartnerSchema = SchemaFactory.createForClass(ShortPartner)
