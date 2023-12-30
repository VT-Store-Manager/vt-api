import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type TimerFlagDocument = TimerFlag & Document

export const ALL_TIMER_FLAG_COLLECTIONS = ['member_vouchers'] as const
export type TimerFlagCollectionTuple = typeof ALL_TIMER_FLAG_COLLECTIONS
export type TimerFlagCollection = TimerFlagCollectionTuple[number]

@Schema({
	versionKey: false,
	timestamps: { createdAt: true },
	suppressReservedKeysWarning: true,
	collection: 'timer_flags',
	discriminatorKey: 'collection',
})
export class TimerFlag {
	_id?: Types.ObjectId

	@Prop({ type: Date, index: { expireAfterSeconds: 0, index: true } })
	expireAt: Date

	@Prop({ type: String, enum: ALL_TIMER_FLAG_COLLECTIONS, required: true })
	collection?: TimerFlagCollection

	@Prop({ type: String })
	action?: string

	createdAt?: Date
}

export const TimerFlagSchema = SchemaFactory.createForClass(TimerFlag)
