import { Document, Types } from 'mongoose'
import mongooseDelete from 'mongoose-delete'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import {
	PromotionLimitation,
	PromotionLimitationSchema,
} from './promotion-limitation.schema'

export type PromotionDocument = Document & Promotion

@Schema({ versionKey: false, timestamps: true })
export class Promotion {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, minlength: 3 })
	title: string

	@Prop({ type: String, default: '' })
	description: string

	@Prop({ type: Types.ObjectId, ref: 'Voucher', required: true })
	voucher: Types.ObjectId | string

	@Prop({ type: Number, min: 0, required: true })
	cost: number

	@Prop({ type: Date, default: new Date(), required: true })
	startTime: Date

	@Prop({
		type: Date,
		validate: {
			validator: function (value: Date) {
				return (this as Promotion).startTime < value
			},
		},
	})
	endTime?: Date

	@Prop({ type: [Types.ObjectId], ref: 'MemberRank', default: () => [] })
	posibleTarget: Array<Types.ObjectId | string>

	@Prop({ type: PromotionLimitationSchema })
	limitation: PromotionLimitation

	@Prop({ type: Boolean, default: false })
	disabled: boolean

	@Prop({ type: Boolean, default: false })
	deleted: boolean

	deletedAt?: Date
	deletedBy?: Types.ObjectId
	createdAt?: Date
	updatedAt?: Date
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion)

PromotionSchema.plugin(mongooseDelete, { deletedAt: true, deletedBy: true })
