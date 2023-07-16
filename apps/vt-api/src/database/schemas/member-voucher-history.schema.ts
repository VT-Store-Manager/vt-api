import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { ShortPartner, ShortPartnerSchema } from './partner.schema'

export type MemberVoucherHistoryDocument = MemberVoucherHistory & Document

@Schema({ versionKey: false, _id: false })
export class ShortVoucherData {
	@Prop({ type: String, required: true })
	title: string

	@Prop({ type: String })
	image?: string

	@Prop({ type: String, required: true })
	code: string

	@Prop({ type: ShortPartnerSchema })
	partner?: ShortPartner

	@Prop({ type: String })
	description: string

	@Prop({ type: Date, required: true })
	startTime: Date

	@Prop({ type: Date, required: true })
	finishTime: Date
}

export const ShortVoucherDataSchema =
	SchemaFactory.createForClass(ShortVoucherData)

@Schema({
	versionKey: false,
	timestamps: { createdAt: true, updatedAt: false },
	collection: 'member_voucher_histories',
})
export class MemberVoucherHistory {
	_id?: Types.ObjectId

	@Prop({ type: Types.ObjectId, required: true })
	member: Types.ObjectId | string

	@Prop({ type: Types.ObjectId, ref: 'Voucher', required: true })
	voucher: Types.ObjectId | string

	@Prop({ type: ShortVoucherDataSchema, required: true })
	voucherData: ShortVoucherData

	@Prop({ type: Date, required: true })
	usedAt: Date

	createdAt?: Date
}

export const MemberVoucherHistorySchema =
	SchemaFactory.createForClass(MemberVoucherHistory)
