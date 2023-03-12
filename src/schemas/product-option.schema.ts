import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import {
	ProductOptionItem,
	ProductOptionItemSchema,
} from './product-option-item.schema'

import mongooseDelete from 'mongoose-delete'

export type ProductOptionDocument = Document & ProductOption

@Schema({ versionKey: false, timestamps: true, collection: 'product_options' })
export class ProductOption {
	_id: Types.ObjectId

	@Prop({ type: Number, unique: true, required: true })
	code: number

	@Prop({ type: String, required: true, index: 'text' })
	name: string

	@Prop({ type: Types.ObjectId, ref: 'ProductOption' })
	parent?: Types.ObjectId | string

	@Prop({
		type: [Number],
		default: [0, 1],
		validate: {
			validator: (v: Array<number>) => {
				return v.length === 2
			},
			message: 'Range of option must be matched with format [min, max]',
		},
	})
	range: Array<number>

	// @Prop({ type: Number, min: 1, default: 1 })
	// maxSelect?: number

	// @Prop({ type: Boolean, default: false })
	// required: boolean

	@Prop([{ type: ProductOptionItemSchema }])
	items: ProductOptionItem[]

	deleted: boolean
	createdAt: Date
	updatedAt: Date
	deletedAt?: Date
}

export const ProductOptionSchema = SchemaFactory.createForClass(ProductOption)

ProductOptionSchema.plugin(mongooseDelete, {
	deletedAt: true,
	overrideMethods: 'all',
})
