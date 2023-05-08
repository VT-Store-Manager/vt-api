import { isNumber } from 'lodash'
import { Types } from 'mongoose'

import { NotificationType } from '@/common/constants'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type NotificationDocument = Notification & Document

@Schema({
	versionKey: false,
	timestamps: true,
})
export class Notification {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, minlength: 1 })
	name: string

	@Prop({ type: String, default: '' })
	description: string

	@Prop({ type: String })
	image?: string

	@Prop({ type: Types.ObjectId })
	targetId?: Types.ObjectId | string

	@Prop({
		type: Number,
		enum: Object.values(NotificationType).filter(v => isNumber(v)),
		default: NotificationType.OTHER,
	})
	type: NotificationType

	@Prop({ type: Boolean, default: false })
	immediate?: boolean

	@Prop({
		type: String,
		validate: (v: string) => {
			const pattern =
				/^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$/
			if (!pattern.test(v)) {
				throw new Error('Cron time is not right pattern')
			}
			return true
		},
	})
	cronTime?: string
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
