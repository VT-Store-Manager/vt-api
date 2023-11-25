import { OrderState } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class TimeLog {
	@Prop({ type: Date, required: true, default: new Date() })
	time: Date

	@Prop({ type: String, required: true, minlength: 1 })
	title: string

	@Prop({ type: String })
	description?: string

	@Prop({
		type: String,
		enum: Object.values(OrderState),
	})
	state?: OrderState
}

export const TimeLogSchema = SchemaFactory.createForClass(TimeLog)
