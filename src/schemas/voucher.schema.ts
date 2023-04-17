import { Types } from 'mongoose'
import mongooseDelete from 'mongoose-delete'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import {
	VoucherCondition,
	VoucherConditionSchema,
} from './voucher-condition.schema'
import {
	VoucherDiscount,
	VoucherDiscountSchema,
} from './voucher-discount.schema'

export type VoucherDocument = Voucher & Document

@Schema({ versionKey: false, timestamps: true })
export class Voucher {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, index: 'text' })
	title: string

	@Prop({ type: String })
	image?: string

	@Prop({
		type: String,
		required: true,
		unique: true,
		index: 'text',
		set: (v: string) => v.toUpperCase(),
	})
	code: string

	@Prop({ type: String, default: '' })
	description: string

	@Prop({ type: Number, default: 0 })
	expireHour: number

	@Prop({ type: Date })
	activeStartTime?: Date

	@Prop({ type: Date })
	activeFinishTime?: Date

	@Prop({ type: VoucherDiscountSchema, default: () => ({}) })
	discount: VoucherDiscount

	@Prop({ type: VoucherConditionSchema, default: () => ({}) })
	condition: VoucherCondition

	@Prop({ type: String })
	slider?: string

	@Prop({ type: Boolean, default: true })
	disabled: boolean

	@Prop({ type: Boolean, default: false })
	deleted: boolean

	deletedAt?: Date
	deletedBy?: Types.ObjectId | string
	createdAt?: Date
	updatedAt?: Date
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher)

VoucherSchema.plugin(mongooseDelete, { deletedAt: true, deletedBy: true })
VoucherSchema.plugin(mongooseLeanVirtuals)
