import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import {
	ProductOptionItem,
	ProductOptionItemSchema,
} from './product-option-item.schema'

export type ProductOptionDocument = Document & ProductOption

@Schema({ versionKey: true, timestamps: true })
export class ProductOption {
	_id: Types.ObjectId

	@Prop({ type: String, unique: true, required: true })
	code: string

	@Prop({ type: String, required: true, index: 'text' })
	name: string

	@Prop({ type: Types.ObjectId, ref: 'ProductOption' })
	parent?: Types.ObjectId

	@Prop({ type: Number, min: 1, default: 1 })
	maxSelect?: number

	@Prop({ type: Boolean, default: false })
	isRequired: boolean

	@Prop([{ type: ProductOptionItemSchema }])
	items: ProductOptionItem[]

	createdAt: Date
	updatedAt: Date
}

export const ProductOptionSchema = SchemaFactory.createForClass(ProductOption)
