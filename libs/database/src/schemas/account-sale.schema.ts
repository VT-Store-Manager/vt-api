import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, Document } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'
import { UpdatedBy, UpdatedBySchema } from './updated-by.schema'

export type AccountSaleDocument = AccountSale & Document & SoftDeleteDocument

@Schema({ versionKey: false, timestamps: true, collection: 'account_sales' })
export class AccountSale {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, unique: true })
	username: string

	@Prop({ type: String, required: true })
	password: string

	@Prop({ type: Types.ObjectId, required: true, ref: 'Store' })
	store: Types.ObjectId

	@Prop({ type: Boolean, default: true })
	forceUpdatePassword: boolean

	@Prop({ type: UpdatedBySchema, required: true })
	updatedBy: UpdatedBy

	deleted?: boolean
	deletedAt?: Date
	deletedBy?: Types.ObjectId
	createdAt?: Date
	updatedAt?: Date
}

export const AccountSaleSchema = SchemaFactory.createForClass(AccountSale)

AccountSaleSchema.plugin(MongooseDelete, {
	deletedBy: true,
	deletedAt: true,
	overrideMethods: 'all',
})
