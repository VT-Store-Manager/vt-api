import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { UpdatedBySchema, UpdatedBy } from './updated-by.schema'

export type AccountAdminPermissionDocument = AccountAdminPermission & Document

@Schema({ versionKey: false })
export class PermissionItem {
	@Prop({ type: String, required: true })
	name: string
}

const PermissionItemSchema = SchemaFactory.createForClass(PermissionItem)

@Schema({
	versionKey: false,
	timestamps: true,
	collection: 'account_admin_permission',
})
export class AccountAdminPermission {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: [PermissionItemSchema] })
	items?: PermissionItem[]

	@Prop({ type: UpdatedBySchema, required: true })
	updatedBy: UpdatedBy

	createdAt?: Date
	updatedAt?: Date
}

export const AccountAdminPermissionSchema = SchemaFactory.createForClass(
	AccountAdminPermission
)
