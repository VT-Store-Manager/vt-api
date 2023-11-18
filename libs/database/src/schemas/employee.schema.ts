import { isNumber } from 'lodash'
import { Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'

import { Gender, validateVnPhoneNumber } from '@app/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type EmployeeDocument = Employee & Document & SoftDeleteDocument

@Schema({ versionKey: false, timestamps: true })
export class Employee {
	_id: Types.ObjectId

	@Prop({
		type: Types.ObjectId,
		ref: 'Store',
		required: true,
		set: (v: string) => new Types.ObjectId(v.toString()),
	})
	store: Types.ObjectId

	@Prop({
		type: String,
		required: true,
		unique: true,
		validate: validateVnPhoneNumber,
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

	/**
	 * @deprecated test
	 */
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
