import { Document } from 'mongoose'

import { SettingType } from '@/common/constants'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type SettingDocument = Setting & Document

@Schema({ versionKey: false, discriminatorKey: 'type' })
export class Setting {
	@Prop({
		type: String,
		enum: Object.values(SettingType),
		required: true,
		unique: true,
		index: true,
	})
	type: SettingType
}

export const SettingSchema = SchemaFactory.createForClass(Setting)
