import { Document, Types } from 'mongoose'
import mongooseDelete from 'mongoose-delete'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

import { Gender } from '@/common/constants'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type UserVirtual = {
	fullName: string
}

export type UserDocument = User & Document & UserVirtual

@Schema({ versionKey: false, timestamps: true })
export class User {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, unique: true })
	email: string

	@Prop({ type: String, required: true, unique: true })
	mobile: string

	@Prop({ type: String })
	avatar: string

	@Prop({ type: String, required: true })
	firstName: string

	@Prop({ type: String, required: true })
	lastName: string

	@Prop({ type: String, enum: Object.values(Gender), required: true })
	gender: Gender

	@Prop({ type: Date, required: true })
	dob: Date

	@Prop({ type: Date })
	createdAt: Date

	@Prop({ type: Date, default: Date.now(), expires: '3m' })
	notVerified: Date

	@Prop({ type: Number, default: Date.now() })
	tokenValidTime: number
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.plugin(mongooseDelete)
UserSchema.plugin(mongooseLeanVirtuals)

UserSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`
})
