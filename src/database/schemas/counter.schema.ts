import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type CounterDocument = Counter & Document

@Schema({ versionKey: false })
export class Counter {
	@Prop({ type: String, required: true, unique: true })
	collectionName: string

	@Prop({ type: Number, min: 1, default: 1 })
	start: number

	@Prop({ type: Number, min: 1 })
	count: number
}

export const CounterSchema = SchemaFactory.createForClass(Counter)
