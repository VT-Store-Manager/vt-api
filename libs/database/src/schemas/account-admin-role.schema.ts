import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { UpdatedBySchema, UpdatedBy } from './updated-by.schema'
import {
	AdminFeature,
	AdminFeaturePermission,
} from '@/apps/admin-api/constants'

export type AccountAdminRoleDocument = AccountAdminRole & Document

@Schema({ versionKey: false, _id: false })
export class SelectedPermissionItem {
	@Prop({ type: String, enum: Object.values(AdminFeature), required: true })
	featureName: string

	@Prop([
		{
			type: [
				{
					type: String,
					enum: Object.values(AdminFeaturePermission),
				},
			],
			default: () => [],
		},
	])
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
