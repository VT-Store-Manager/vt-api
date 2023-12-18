import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { SchemaTypes, Types } from 'mongoose'

export const targetTypes = ['store', 'member', 'shipper', 'admin'] as const
export const requestTypes = ['withdraw'] as const
export enum RequestStatus {
	APPROVED = 'approved',
	DECLINED = 'declined',
	PENDING = 'pending',
}
export const requestPriority = ['high', 'medium', 'low'] as const

export type AdminRequestDocument = AdminRequest & Document

@Schema({ versionKey: false, timestamps: true, collection: 'admin_requests' })
export class AdminRequest {
	_id?: Types.ObjectId

	@Prop({
		type: Types.ObjectId,
		required: true,
		set: v => new Types.ObjectId(v),
		index: 1,
	})
	targetId: Types.ObjectId | string

	@Prop({ type: String, enum: targetTypes, required: true, index: 1 })
	targetType: (typeof targetTypes)[number]

	@Prop({ type: String, enum: requestTypes, required: true, index: 1 })
	requestType: (typeof requestTypes)[number]

	@Prop({ type: SchemaTypes.Mixed, default: () => ({}) })
	requestData: {
		withdrawAmount?: number
	}

	@Prop({
		type: String,
		enum: Object.values(RequestStatus),
		default: RequestStatus.PENDING,
	})
	status?: RequestStatus

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
