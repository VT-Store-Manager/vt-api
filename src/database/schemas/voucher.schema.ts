import { Types } from 'mongoose'
import mongooseDelete from 'mongoose-delete'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { ShortPartner, ShortPartnerSchema } from './partner.schema'
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

	@Prop({
		type: Types.ObjectId,
		ref: 'Partner',
		set: (v: string) => new Types.ObjectId(v),
	})
	partner?: Types.ObjectId

	@Prop({ type: String, default: '' })
	description: string

	@Prop({ type: Number, default: 24 * 30 })
	expireHour: number

	@Prop({ type: Date, default: new Date() })
	activeStartTime?: Date

	@Prop({
		type: Date,
		validate: {
			validator: function (value: Date) {
				return (this as Voucher).activeStartTime < value
			},
		},
	})
	activeFinishTime?: Date

	@Prop({ type: () => VoucherDiscountSchema, default: () => ({}) })
	discount: VoucherDiscount

	@Prop({ type: () => VoucherConditionSchema, default: () => ({}) })
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

@Schema({ versionKey: false, _id: false })
export class ShortVoucher {
	@Prop({ type: Types.ObjectId })
	id: Types.ObjectId

	@Prop({ type: String, required: true })
	title: string

	@Prop({ type: String, required: true })
	code: string

	@Prop({ type: String })
	image?: string

	@Prop({ type: ShortPartnerSchema })
	partner?: ShortPartner
}

export const ShortVoucherSchema = SchemaFactory.createForClass(ShortVoucher)
