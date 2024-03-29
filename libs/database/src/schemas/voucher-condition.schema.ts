import { ShippingMethod } from '@app/common'
import { optionItemKeyLength } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema({ versionKey: false, _id: false })
export class ConditionInclusion {
	@Prop({
		type: [Types.ObjectId],
		default: [],
		set: (v: string[]) => v.map(id => new Types.ObjectId(id)),
	})
	ids?: Array<Types.ObjectId | string>

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

	@Prop({ type: Boolean, default: false })
	required: boolean
}
const ConditionInclusionSchema =
	SchemaFactory.createForClass(ConditionInclusion)

@Schema({ versionKey: false, _id: false })
export class VoucherCondition {
	@Prop({ type: Number, default: -1 })
	minQuantity?: number

	@Prop({ type: Number, default: -1 })
	minPrice?: number

	@Prop({
		type: Number,
		enum: Object.values(ShippingMethod).filter(e => !isNaN(+e)),
		default: ShippingMethod.NONE,
	})
	shippingMethod?: ShippingMethod

	@Prop({
		type: [ConditionInclusionSchema],
		default: [],
		_id: false,
		validate: {
			validator: (v: ConditionInclusion[]) => {
				if (!Array.isArray(v)) return false
				return v.every(target => {
					return target.ids || target.options.length > 0
				})
			},
			message: 'Condition of inclusion is invalid',
		},
	})
	inclusion?: ConditionInclusion[]
}

export const VoucherConditionSchema =
	SchemaFactory.createForClass(VoucherCondition)
