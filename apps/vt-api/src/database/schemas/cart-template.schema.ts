import { Types, Document } from 'mongoose'
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { optionItemKeyLength } from '@/common/helpers/key.helper'

export type CartTemplateDocument = Document & CartTemplate

@Schema({ versionKey: false, _id: false })
export class CartProduct {
	@Prop({
		type: Types.ObjectId,
		required: true,
		ref: 'Product',
		set: (v: string) => new Types.ObjectId(v),
	})
	id: Types.ObjectId | string

	@Prop({
		type: [String],
		default: [],
		validate: function (v: string[]) {
			const pattern = new RegExp(`^[a-z]{${optionItemKeyLength}}$`)
			v.forEach(key => {
				if (!pattern.test(key))
					throw new Error(
						`Product ${(this as CartProduct).id} does not contain item ${key}`
					)
				return true
			})
		},
	})
	options?: string[] = []

	@Prop({ type: Number, default: 1 })
	amount?: number = 1
}

export const CartProductSchema = SchemaFactory.createForClass(CartProduct)

@Schema({ versionKey: false, timestamps: true, collection: 'cart_templates' })
export class CartTemplate {
	_id?: Types.ObjectId

	@Prop({ type: Types.ObjectId, required: true, ref: 'Member' })
	member: Types.ObjectId | string

	@Prop({ type: String, required: true, minlength: 1 })
	name: string

	@Prop({ type: Number })
	index?: number

	@Prop([{ type: CartProductSchema }])
	products: CartProduct[]

	createdAt?: Date
	updatedAt?: Date
}

export const CartTemplateSchema = SchemaFactory.createForClass(CartTemplate)
