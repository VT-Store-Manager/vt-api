import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type MemberVoucherDocument = Document & MemberVoucher

@Schema({ versionKey: false, timestamps: true, collection: 'member_vouchers' })
export class MemberVoucher {
	_id?: Types.ObjectId

	@Prop({ type: Types.ObjectId, ref: 'Member' })
	member: Types.ObjectId | string

	@Prop({ type: Types.ObjectId, ref: 'Voucher' })
	voucher: Types.ObjectId | string

	@Prop({ type: Date, required: true })
	startTime: Date

	@Prop({
		type: Date,
		index: { expireAfterSeconds: 0, index: true },
		validate: {
			validator: function (value: Date) {
				return (this as MemberVoucher).startTime < value
			},
		},
	})
	finishTime?: Date

	createdAt?: Date
	updatedAt?: Date
}

export const MemberVoucherSchema = SchemaFactory.createForClass(MemberVoucher)
