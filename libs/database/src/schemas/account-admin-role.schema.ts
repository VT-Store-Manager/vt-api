import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { UpdatedBySchema, UpdatedBy } from './updated-by.schema'

export type AccountAdminRoleDocument = AccountAdminRole & Document

@Schema({ versionKey: false })
export class SelectedPermissionItem {
	@Prop({ type: Types.ObjectId, set: (v: string) => new Types.ObjectId(v) })
	_id: Types.ObjectId

	@Prop({
		type: [Types.ObjectId],
		default: () => [],
		set: (v: string[]) => v.map(_v => new Types.ObjectId(_v)),
	})
	scopes: Types.ObjectId[]
}
export const SelectedPermissionItemSchema = SchemaFactory.createForClass(
	SelectedPermissionItem
)

@Schema({
	versionKey: false,
	timestamps: true,
	collection: 'account_admin_roles',
})
export class AccountAdminRole {
	_id?: Types.ObjectId

	@Prop({ type: String, required: true })
	name: string

	@Prop({
		type: [SelectedPermissionItemSchema],
		required: true,
		default: () => [],
	})
	permissions: SelectedPermissionItem[]

	@Prop({ type: UpdatedBySchema, required: true })
	updatedBy: UpdatedBy

	createdAt?: Date
	updatedAt?: Date
}

export const AccountAdminRoleSchema =
	SchemaFactory.createForClass(AccountAdminRole)
