import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type RefreshTokenDocument = Document & RefreshToken

@Schema({
	versionKey: false,
	timestamps: { createdAt: true },
	collection: 'refresh_tokens',
})
export class RefreshToken {
	@Prop({ type: Types.ObjectId })
	uid: Types.ObjectId

	@Prop({
		type: String,
		required: true,
		unique: true,
	})
	value: string

	@Prop({
		type: Boolean,
		default: false,
	})
	disabled: boolean

	@Prop({
		type: Date,
		expires: '30d',
		required: true,
		default: Date.now(),
	})
	createdAt: Date
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken)
