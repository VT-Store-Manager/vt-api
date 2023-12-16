import { Document, Types } from 'mongoose'
import mongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import {
	ProductOptionItem,
	ProductOptionItemSchema,
} from './product-option-item.schema'

export type ProductOptionDocument = Document &
	ProductOption &
	SoftDeleteDocument

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
				return v.length === 2 && v[0] >= 0 && v[1] >= v[0]
			},
			message: 'Range of option must be matched with format [min, max]',
		},
	})
	range: Array<number>

	@Prop({ type: [String], default: [] })
	defaultSelect: string[]

	@Prop([{ type: ProductOptionItemSchema }])
	items: ProductOptionItem[]

	@Prop({ type: Boolean, default: false })
	disabled: boolean

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
