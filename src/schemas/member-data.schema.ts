import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type MemberDataDocument = MemberData & Document

@Schema({ versionKey: false, timestamps: true, collection: 'member_datas' })
export class MemberData {
	_id?: Types.ObjectId

	@Prop({ type: Types.ObjectId, unique: true, ref: 'Member' })
	member: Types.ObjectId | string

	@Prop({ type: [Types.ObjectId], default: [] })
	favorites?: Array<Types.ObjectId | string>

	createdAt?: Date
	updatedAt?: Date
}

export const MemberDataSchema = SchemaFactory.createForClass(MemberData)
