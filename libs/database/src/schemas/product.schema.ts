import { Exclude } from 'class-transformer'
import { Document, Types } from 'mongoose'
import mongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type ProductDocument = Product & Document & SoftDeleteDocument

@Schema({ versionKey: false, timestamps: true })
export class Product {
	@Exclude()
	_id: Types.ObjectId

	@Prop({ type: Number, required: true, unique: true })
	code: number

	@Prop({ type: String, required: true, index: 'text' })
	name: string

	@Prop([{ type: String }])
	images: string[]

	@Prop({ type: Number, required: true, min: 0 })
	originalPrice: number

	@Prop({
		type: Types.ObjectId,
		ref: 'ProductCategory',
		set: v => new Types.ObjectId(v),
	})
	category: Types.ObjectId | string

	@Prop({ type: String })
	description: string

	@Prop([
		{
			type: Types.ObjectId,
			ref: 'ProductOption',
			set: (v: string) => new Types.ObjectId(v.toString()),
		},
	])
	options: Types.ObjectId[] | string[]

	@Prop({ type: Boolean, default: false })
	disabled: boolean

	createdAt: Date
	updatedAt: Date
	deleted?: boolean
	deletedAt?: Date
}

export const ProductSchema = SchemaFactory.createForClass(Product)

ProductSchema.plugin(mongooseDelete, {
	deletedAt: true,
	overrideMethods: 'all',
})
