import { Document } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type ProductOptionItemDocument = Document & ProductOptionItem

@Schema({ versionKey: false, _id: false })
export class ProductOptionItem {
	@Prop({ type: String, unique: true, required: true })
	key: string

	@Prop({ type: String })
	parentKey?: string

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: Number, required: true, min: 0 })
	cost: number

	@Prop({ type: Boolean, default: false })
	disabled: boolean

	@Prop({ type: Boolean, default: false })
	isDefault?: boolean
}

export const ProductOptionItemSchema =
	SchemaFactory.createForClass(ProductOptionItem)
