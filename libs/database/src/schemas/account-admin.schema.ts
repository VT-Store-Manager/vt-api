import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type AccountAdminDocument = AccountAdmin & Document

@Schema({ versionKey: false, timestamps: true, collection: 'account_admins' })
export class AccountAdmin {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, unique: true })
	username: string

	@Prop({ type: String, required: true })
	password: string

	@Prop({ type: Types.ObjectId, required: true })
	role: Types.ObjectId[]

	@Prop({ type: [Types.ObjectId], default: () => [], ref: 'Store' })
	stores: Types.ObjectId[]

	createdAt?: Date
	updatedAt?: Date
}

export const AccountAdminSchema = SchemaFactory.createForClass(AccountAdmin)
