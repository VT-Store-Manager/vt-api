import { Document, Types } from 'mongoose'

import { s3KeyPattern } from '@/common/constants'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type NewsDocument = News & Document

@Schema({ versionKey: false, timestamps: true })
export class News {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, minlength: 1 })
	name: string

	@Prop({
		type: String,
		required: true,
		validate: (v: string) => {
			if (s3KeyPattern.test(v)) return true
			throw new Error('Image key is invalid')
		},
	})
	image: string

	@Prop({ type: String, required: true })
	content: string

	createdAt?: Date
	updatedAt?: Date
}

export const NewsSchema = SchemaFactory.createForClass(News)
