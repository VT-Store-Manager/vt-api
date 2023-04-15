import { Types, Document } from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type MemberRankDocument = MemberRank & Document & MemberRankVirtual

@Schema({ versionKey: false, timestamps: true, collection: 'member_ranks' })
export class MemberRank {
	_id?: Types.ObjectId

	@Prop({
		type: Types.ObjectId,
		required: true,
		ref: 'Member',
		unique: 1,
	})
	member: Types.ObjectId | string

	@Prop({ type: String, unique: true, required: true })
	code: string

	@Prop({ type: Types.ObjectId, required: true, ref: 'Rank' })
	rank: Types.ObjectId | string

	@Prop({ type: Number, default: 0 })
	usedPoint?: number

	@Prop({ type: Number, default: 0 })
	expiredPoint?: number

	@Prop({ type: Number, default: 0 })
	currentPoint?: number

	createdAt?: Date
	updatedAt?: Date
}

export const MemberRankSchema = SchemaFactory.createForClass(MemberRank)

export type MemberRankVirtual = {
	totalPoint: number
}

MemberRankSchema.plugin(mongooseLeanVirtuals)
MemberRankSchema.virtual('totalPoint').get(function () {
	return this.usedPoint + this.expiredPoint + this.currentPoint
})
