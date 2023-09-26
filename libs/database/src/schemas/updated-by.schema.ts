import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({ versionKey: false, _id: false })
export class UpdatedBy {
	@Prop({ type: Types.ObjectId, required: true, index: 1 })
	accountId: Types.ObjectId

	@Prop({ type: String, required: true, index: 1 })
	accountUsername: string

	@Prop({ type: Date, required: true, default: () => new Date() })
	time: Date
}

export const UpdatedBySchema = SchemaFactory.createForClass(UpdatedBy)
