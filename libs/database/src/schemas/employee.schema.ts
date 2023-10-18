import { Gender, Joi } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { isNumber } from 'lodash'
import { Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'

export type EmployeeDocument = Employee & Document & SoftDeleteDocument

@Schema({ versionKey: false, timestamps: true })
export class Employee {
	_id: Types.ObjectId

	@Prop({ type: Types.ObjectId, ref: 'Store', required: true })
	store: Types.ObjectId

	@Prop({
		type: String,
		required: true,
		unique: true,
		validate: (v: string) => {
			const error = Joi.string().phoneNumber({ strict: true }).validate(v).error
			if (error)
				throw new Error(
					error.message ||
						error.details.map(detail => detail.message).join(', ')
				)
			return true
		},
	})
	phone: string

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true })
	avatar: string
	@Prop({
		type: Number,
		enum: Object.values(Gender).filter(e => isNumber(e)),
		required: true,
	})
	gender: Gender

	@Prop({ type: Date, required: true })
	dob: Date

	deleted?: boolean
	deletedAt?: Date
	deletedBy?: Types.ObjectId
	createdAt?: Date
	updatedAt?: Date
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee)

EmployeeSchema.plugin(MongooseDelete, {
	deletedBy: true,
	deletedAt: true,
	overrideMethods: 'all',
})
