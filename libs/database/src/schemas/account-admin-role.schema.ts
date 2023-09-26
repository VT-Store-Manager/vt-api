import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { UpdatedBySchema, UpdatedBy } from './updated-by.schema'
import {
	AdminFeature,
	AdminFeaturePermission,
} from '@/apps/admin/constants'
import MongooseDelete, { SoftDeleteDocument } from 'mongoose-delete'

export type AccountAdminRoleDocument = AccountAdminRole &
	Document &
	SoftDeleteDocument

@Schema({ versionKey: false, _id: false })
export class SelectedPermissionItem {
	@Prop({ type: String, enum: Object.values(AdminFeature), required: true })
	featureName: string

	@Prop({
		type: [
			{
				type: String,
				enum: Object.values(AdminFeaturePermission),
			},
		],
		default: () => [],
	})
	scopes: string[]
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

	deleted?: boolean
	deletedAt?: Date
	deletedBy?: Types.ObjectId
	createdAt?: Date
	updatedAt?: Date
}

export const AccountAdminRoleSchema =
	SchemaFactory.createForClass(AccountAdminRole)

AccountAdminRoleSchema.plugin(MongooseDelete, {
	deletedBy: true,
	deletedAt: true,
	overrideMethods: 'all',
})
