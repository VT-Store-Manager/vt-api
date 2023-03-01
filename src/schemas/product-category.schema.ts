import { Document, Types } from 'mongoose'
import mongooseDelete from 'mongoose-delete'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type ProductCategoryDocument = ProductCategory & Document

@Schema({ versionKey: false, timestamps: true })
export class ProductCategory {
	_id: Types.ObjectId

	@Prop({ type: String, required: true, unique: true, index: 'text' })
	code: string

	@Prop({ type: String, required: true, index: 'text' })
	name: string

	@Prop({ type: String })
	image: string

	@Prop({ type: Number, min: 1 })
	displayOrder: number

	@Prop({ type: Boolean, default: false })
	disabled: boolean

	createdAt: Date
	updatedAt: Date
}

export const ProductCategorySchema =
	SchemaFactory.createForClass(ProductCategory)

ProductCategorySchema.plugin(mongooseDelete, { deletedAt: true })
