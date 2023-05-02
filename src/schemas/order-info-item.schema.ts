import { Types } from 'mongoose'

import { optionItemKeyLength } from '@/common/helpers/key.helper'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, _id: false })
export class OrderInfoItem {
	_id?: Types.ObjectId

	@Prop({
		type: Types.ObjectId,
		ref: 'Product',
		required: true,
		set: (v: string) => new Types.ObjectId(v),
	})
	productId: Types.ObjectId | string

	@Prop({
		type: Types.ObjectId,
		ref: 'ProductCategory',
		required: true,
		set: (v: string) => new Types.ObjectId(v),
	})
	category: Types.ObjectId | string

	@Prop({
		type: [String],
		default: () => [],
		validate: (v: string[]) => {
			if (!v || !Array.isArray(v)) {
				throw new Error('Options must be an array')
			}

			const validateKeys = v.every(key =>
				new RegExp(`[a-z]{${optionItemKeyLength}}`).test(key)
			)
			if (!validateKeys) {
				throw new Error(
					`Option keys must match with pattern [a-z]{${optionItemKeyLength}}`
				)
			}
			return true
		},
	})
	options?: string[] = []

	@Prop({
		type: String,
		required: true,
		minlength: 1,
	})
	name: string

	@Prop({ type: Number, min: 1, required: true })
	quantity: number

	@Prop({ type: String, default: '' })
	note?: string = ''

	@Prop({ type: Number, min: 0, required: true })
	unitPrice: number

	@Prop({ type: Number, min: 0, default: 0 })
	unitSalePrice?: number
}

export const OrderInfoItemSchema = SchemaFactory.createForClass(OrderInfoItem)
