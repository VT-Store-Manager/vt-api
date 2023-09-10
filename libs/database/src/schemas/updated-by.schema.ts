import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({ versionKey: false, _id: false })
export class UpdatedBy {
	@Prop({ type: Types.ObjectId, required: true, unique: 1 })
	accountId: Types.ObjectId

	@Prop({ type: String, required: true })
	accountUsername: string

	@Prop({ type: Date, required: true, default: () => new Date() })
	time: Date
}

export const UpdatedBySchema = SchemaFactory.createForClass(UpdatedBy)
