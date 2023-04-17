import { optionItemKeyLength } from '@/common/helpers/key.helper'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({ versionKey: false, _id: false })
export class OfferTarget {
	@Prop({ type: Types.ObjectId })
	id?: string | Types.ObjectId

	@Prop({
		type: [String],
		validate: {
			validator: (v: string[]) => {
				if (!Array.isArray(v)) {
					return false
				}
				const pattern = new RegExp(
					`^[a-z]{${optionItemKeyLength}}((&|(\\|))[a-z]{${optionItemKeyLength}}){0,}$`
				)
				return v.every(keyString => pattern.test(keyString))
			},
			message: 'Option key string is not valid',
		},
		default: [],
	})
	options?: string[]

	@Prop({ type: Number, default: 0 })
	quantity?: number

	@Prop({ type: Number, required: true })
	salePrice: number
}
const OfferTargetSchema = SchemaFactory.createForClass(OfferTarget)

@Schema({ versionKey: false, _id: false })
export class VoucherDiscount {
	@Prop({ type: Number, default: -1 })
	maxDiscount: number

	@Prop({ type: Boolean, default: false })
	freeship?: boolean

	@Prop({ type: Number, default: -1 })
	percentage?: number

	@Prop({ type: Number, default: -1 })
	decrease?: number

	@Prop({ type: Number, default: -1 })
	salePrice?: number

	@Prop({ type: Number, default: -1 })
	offerAny?: number

	@Prop({
		type: [OfferTargetSchema],
		default: [],
		_id: false,
		validate: {
			validator: (v: OfferTarget[]) => {
				if (!Array.isArray(v)) return false
				return v.every(target => {
					return target.id || target.options.length > 0
				})
			},
			message: 'Offer of target is invalid',
		},
	})
	offerTarget?: OfferTarget[]
}

export const VoucherDiscountSchema =
	SchemaFactory.createForClass(VoucherDiscount)