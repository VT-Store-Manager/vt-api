import { Document, Types } from 'mongoose'
import mongooseDelete from 'mongoose-delete'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type ProductDocument = Product & Document

@Schema({ versionKey: false, timestamps: true })
export class Product {
	_id: Types.ObjectId

	@Prop({ type: String, required: true, unique: true, index: 'text' })
	code: string

	@Prop({ type: String, required: true, index: 'text' })
	name: string

	@Prop([{ type: String }])
	images: string[]

	@Prop({ type: Number, required: true, min: 0 })
	originalPrice: number

	@Prop({ type: Types.ObjectId, ref: 'ProductCategory' })
	category: Types.ObjectId

	@Prop({ type: String })
	description: string

	@Prop([{ type: Types.ObjectId, ref: 'ProductOption' }])
	options: Types.ObjectId[]

	@Prop({ type: Boolean, default: false })
	disabled: boolean

	createdAt: Date
	updatedAt: Date
	deleted?: boolean
	deletedAt?: Date
}

export const ProductSchema = SchemaFactory.createForClass(Product)

ProductSchema.plugin(mongooseDelete, { deletedAt: true })
