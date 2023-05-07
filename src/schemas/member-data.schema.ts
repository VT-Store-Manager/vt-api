import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import {
	MemberAddress,
	MemberAddressSchema,
	MemberMainAddress,
	MemberMainAddressSchema,
} from './member-address.schema'

@Schema({ versionKey: false, _id: false })
export class MemberAddressList {
	@Prop({ type: [MemberMainAddressSchema], default: [] })
	main: MemberMainAddress[]

	@Prop({ type: [MemberAddressSchema], default: [] })
	other: MemberAddress[]
}
export const MemberAddressListSchema =
	SchemaFactory.createForClass(MemberAddressList)

export type MemberDataDocument = MemberData & Document
@Schema({ versionKey: false, timestamps: true, collection: 'member_data' })
export class MemberData {
	_id?: Types.ObjectId

	@Prop({ type: Types.ObjectId, unique: true, ref: 'Member' })
	member: Types.ObjectId | string

	@Prop({ type: [Types.ObjectId], default: [] })
	favoriteProducts?: Array<Types.ObjectId | string>

	@Prop({ type: [Types.ObjectId], default: [] })
	favoriteStores?: Array<Types.ObjectId | string>

	@Prop({ type: MemberAddressListSchema, default: () => ({}) })
	address?: MemberAddressList

	createdAt?: Date
	updatedAt?: Date
}
export const MemberDataSchema = SchemaFactory.createForClass(MemberData)
