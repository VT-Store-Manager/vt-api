import { Document, Types } from 'mongoose'

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type AccountSaleDocument = AccountSale & Document

@Schema({ versionKey: false, timestamps: true, collection: 'account_sales' })
export class AccountSale {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true, unique: true })
	username: string

	@Prop({ type: String, required: true })
	password: string

	@Prop({ type: Types.ObjectId, required: true, ref: 'Store' })
	store: Types.ObjectId
}

export const AccountSaleSchema = SchemaFactory.createForClass(AccountSale)
