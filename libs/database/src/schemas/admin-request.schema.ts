import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

const targetTypes = ['store', 'member', 'shipper', 'admin'] as const
const requestTypes = ['withdraw'] as const
const requestStatus = ['accepted', 'declined', 'pending'] as const
const requestPriority = ['high', 'medium', 'low'] as const

export type AdminRequestDocument = AdminRequest & Document

@Schema({ versionKey: false, timestamps: true })
export class AdminRequest {
	_id?: Types.ObjectId

	@Prop({
		type: Types.ObjectId,
		required: true,
		set: v => new Types.ObjectId(v),
	})
	targetId: Types.ObjectId | string

	@Prop({ type: String, enum: targetTypes, required: true })
	targetType: (typeof targetTypes)[number]

	@Prop({ type: String, enum: requestTypes, required: true })
	requestType: (typeof requestTypes)[number]

	@Prop({ type: String, enum: requestStatus, default: 'pending' })
	status?: (typeof requestStatus)[number]

	@Prop({ type: String, enum: requestPriority, default: 'medium' })
	priority?: (typeof requestPriority)[number]

	@Prop({ type: String, default: '' })
	title?: string

	@Prop({ type: String, default: '' })
	description?: string

	createdAt?: Date
	updatedAt?: Date
}

export const AdminRequestSchema = SchemaFactory.createForClass(AdminRequest)
