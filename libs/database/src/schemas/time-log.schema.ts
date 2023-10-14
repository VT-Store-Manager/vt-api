import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class TimeLog {
	@Prop({ type: Date, required: true, default: new Date() })
	time: Date

	@Prop({ type: String, required: true, minlength: 1 })
	title: string

	@Prop({ type: String })
	description?: string
}

export const TimeLogSchema = SchemaFactory.createForClass(TimeLog)
