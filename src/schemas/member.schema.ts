import { isNumber } from 'lodash'
import { Document, Types } from 'mongoose'
import mongooseDelete from 'mongoose-delete'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

import { Gender } from '@/common/constants'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type MemberVirtual = {
	fullName: string
}

export type MemberDocument = Member & Document & MemberVirtual

@Schema({ versionKey: false, timestamps: true })
export class Member {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, unique: true, index: 1 })
	phone: string

	@Prop({ type: String })
	email?: string

	@Prop({ type: String })
	avatar?: string

	@Prop({ type: String, required: true })
	firstName: string

	@Prop({ type: String, required: true })
	lastName: string

	@Prop({
		type: Number,
		enum: Object.values(Gender).filter(e => isNumber(e)),
		required: true,
	})
	gender: Gender

	@Prop({ type: Date, required: true })
	dob: Date

	@Prop({ type: Date, default: Date.now(), expires: '5m' })
	notVerified: Date

	@Prop({ type: Date, default: Date.now() })
	tokenValidTime: Date

	deleted: boolean
	deletedAt?: Date
	createdAt?: Date
	updatedAt?: Date
}

export const MemberSchema = SchemaFactory.createForClass(Member)

MemberSchema.plugin(mongooseDelete)
MemberSchema.plugin(mongooseLeanVirtuals)

MemberSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`
})
