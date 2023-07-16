import { Document } from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

import { ContactType, SettingType } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type VirtualData = {
	variables: {
		brandName: string
		address: string
		country: string
	}
}

export type SettingGeneralDocument = Document & SettingGeneral & VirtualData

export class Contact {
	name: string
	type: ContactType
	info: string
}
const ContactDefine = {
	name: { type: String, required: true },
	type: {
		type: String,
		enum: Object.values(ContactType),
		default: ContactType.OTHER,
	},
	info: { type: String, required: true },
}

export class OwnBrand {
	name: string
	image: string
}

@Schema({
	versionKey: false,
})
export class SettingGeneral {
	type: SettingType.GENERAL

	@Prop({
		type: {
			name: String,
			image: String,
		},
	})
	brand: OwnBrand

	@Prop({ type: String })
	address: string

	@Prop({ type: String })
	country: string

	@Prop({ type: String })
	storeContact: string

	@Prop({ type: [ContactDefine], _id: false })
	contact: Array<Contact>
}

export const SettingGeneralSchema = SchemaFactory.createForClass(SettingGeneral)

SettingGeneralSchema.plugin(mongooseLeanVirtuals)
