import { isNumber } from 'lodash'
import { Types } from 'mongoose'

import { NotificationType } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({
	versionKey: false,
	timestamps: { createdAt: true, updatedAt: false },
	collection: 'member_notifications',
})
export class MemberNotification {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, minlength: 1 })
	name: string

	@Prop({ type: String, default: '' })
	description: string

	@Prop({ type: String })
	image?: string

	@Prop({ type: Types.ObjectId })
	targetId?: Types.ObjectId | string

	@Prop({ type: Boolean, default: false })
	checked?: boolean

	@Prop({
		type: Number,
		enum: Object.values(NotificationType).filter(v => isNumber(v)),
		default: NotificationType.OTHER,
	})
	type: NotificationType

	createdAt?: Date
}

export const MemberNotificationSchema =
	SchemaFactory.createForClass(MemberNotification)
