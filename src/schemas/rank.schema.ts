import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type RankDocument = Rank & Document

export class RankAppearance {
	icon: string
	color: string
	background: string
}

@Schema({ versionKey: false, timestamps: true })
export class Rank {
	_id: Types.ObjectId

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: Number, required: true, index: true, min: 0 })
	rank: number

	@Prop({
		type: {
			icon: { type: String },
			color: { type: String },
			background: { type: String },
		},
		required: true,
		_id: false,
	})
	appearance: RankAppearance

	@Prop({ type: Number, required: true, min: 0, default: 0 })
	minPoint: number

	@Prop({ type: Number, required: true, min: 1, default: 1 })
	coefficientPoint: number
}

export const RankSchema = SchemaFactory.createForClass(Rank)
