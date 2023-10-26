import { isNumber } from 'lodash'
import { Document, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

import { Gender } from '@app/common'
import { Joi } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type MemberVirtual = {
	fullName: string
}

export type MemberDocument = Member &
	Document &
	MemberVirtual &
	SoftDeleteDocument

@Schema({ versionKey: false, timestamps: true })
export class Member {
	_id?: Types.ObjectId

	@Prop({
		type: String,
		required: true,
		unique: true,
		index: 'text',
		validate: (v: string) => {
			const error = Joi.string().phoneNumber({ strict: true }).validate(v).error
			if (error)
				throw new Error(
					error.message ||
						error.details.map(detail => detail.message).join(', ')
				)
			return true
		},
	})
	phone: string

	@Prop({ type: String, index: 'text' })
	email?: string

	@Prop({ type: String })
	avatar?: string

	@Prop({ type: String, required: true, index: 'text' })
	firstName: string

	@Prop({ type: String, required: true, index: 'text' })
	lastName: string

	@Prop({
		type: Number,
		enum: Object.values(Gender).filter(e => isNumber(e)),
		required: true,
	})
	gender: Gender

	@Prop({ type: Date, required: true })
	dob: Date

	@Prop({ type: Date, default: Date.now(), expires: '10m' })
	notVerified: Date

	@Prop({ type: Date, default: Date.now() })
	tokenValidTime: Date

	deleted: boolean
	deletedAt?: Date
	createdAt?: Date
	updatedAt?: Date
}

export const MemberSchema = SchemaFactory.createForClass(Member)

MemberSchema.plugin(MongooseDelete, {
	deletedAt: true,
	overrideMethods: 'all',
})
MemberSchema.plugin(mongooseLeanVirtuals)

MemberSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`
})
