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

	@Prop({ type: String })
	image?: string

	@Prop({
		type: Types.ObjectId,
		ref: 'Voucher',
		required: true,
		set: v => {
			if (typeof v === 'string') return new Types.ObjectId(v)
			return v
		},
	})
	voucher: Types.ObjectId | string

	@Prop({ type: Number, min: 0, required: true })
	cost: number

	@Prop({
		type: Date,
		default: new Date(),
		required: true,
		validate: {
			validator: function (value: any) {
				return value instanceof Date || typeof value === 'number'
			},
		},
		set: (v: Date | number) => {
			if (typeof v === 'number') return new Date(v)
			return v
		},
	})
	startTime: Date | number

	@Prop({
		type: Date,
		validate: {
			validator: function (value: any) {
				if (value instanceof Date || typeof value === 'number') {
					return (this as Promotion).startTime < value
				}
				return false
			},
		},
		set: (v: Date | number) => {
			if (typeof v === 'number') return new Date(v)
			return v
		},
	})
	finishTime?: Date | number

	@Prop({ type: [Types.ObjectId], ref: 'MemberRank', default: () => [] })
	possibleTarget: Array<Types.ObjectId | string>

	@Prop({ type: [PromotionLimitationSchema] })
	limitation: PromotionLimitation[]

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
