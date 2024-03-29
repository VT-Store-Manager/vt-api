import { Document, Types } from 'mongoose'

import { s3KeyPattern } from '@app/common'
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

	@Prop({
		type: [Types.ObjectId],
		default: [],
		set: (v: string[]) => v.map(id => new Types.ObjectId(id)),
	})
	tags?: Types.ObjectId[]

	createdAt?: Date
	updatedAt?: Date
}

export const NewsSchema = SchemaFactory.createForClass(News)
