import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { MemberAddress, MemberAddressSchema } from './member-address.schema'
import {
	MemberNotification,
	MemberNotificationSchema,
} from './member-notification.schema'

@Schema({ versionKey: false, _id: false })
export class MemberAddressList {
	@Prop({ type: [MemberAddressSchema], default: [] })
	main: MemberAddress[]

	@Prop({ type: [MemberAddressSchema], default: [] })
	other: MemberAddress[]
}
export const MemberAddressListSchema =
	SchemaFactory.createForClass(MemberAddressList)

@Schema({ versionKey: false, _id: false })
export class MemberSetting {
	@Prop({ type: Boolean, default: true })
	pushNotification?: boolean
}
export const MemberSettingSchema = SchemaFactory.createForClass(MemberSetting)

export type MemberDataDocument = MemberData & Document
@Schema({
	versionKey: false,
	timestamps: true,
	suppressReservedKeysWarning: true,
	collection: 'member_data',
})
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

	@Prop({ type: [MemberNotificationSchema], default: () => [] })
	notifications?: MemberNotification[]

	@Prop({ type: MemberSettingSchema, default: () => ({}) })
	setting?: MemberSetting

	createdAt?: Date
	updatedAt?: Date
}
export const MemberDataSchema = SchemaFactory.createForClass(MemberData)
