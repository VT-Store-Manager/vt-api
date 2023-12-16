import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { SettingType } from '@app/common'

export type SettingSaleAppDocument = Document & SettingSaleApp

@Schema({
	versionKey: false,
})
export class SettingSaleApp {
	type: SettingType

	@Prop({ type: String })
	appName: string

	@Prop({
		type: {
			minWithdraw: { type: Number, min: 0, default: 100000 },
		},
		default: () => ({
			minWithdraw: 100000,
		}),
	})
	shipper: {
		minWithdraw: number
	}
}

export const SettingSaleAppSchema = SchemaFactory.createForClass(SettingSaleApp)
