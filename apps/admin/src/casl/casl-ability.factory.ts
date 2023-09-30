import uniq from 'lodash/uniq'
import { Model, Types } from 'mongoose'

import { AdminFeature, Actions } from '@admin/constants'
import {
	AccountAdmin,
	AccountAdminDocument,
	Order,
	SelectedPermissionItem,
	Store,
} from '@app/database'
import { AccountAdminPayload } from '@app/types'
import {
	AbilityBuilder,
	createMongoAbility,
	ExtractSubjectType,
	InferSubjects,
	MongoAbility,
	MongoQuery,
} from '@casl/ability'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

export type Subjects = InferSubjects<typeof Store | typeof Order> | AdminFeature
type PossibleAbilities = [Actions, Subjects]
type Conditions = MongoQuery

export type AdminAbility = MongoAbility<PossibleAbilities, Conditions>

@Injectable()
export class CaslAbilityFactory {
	constructor(
		@InjectModel(AccountAdmin.name)
		private readonly accountAdminModel: Model<AccountAdminDocument>
	) {}

	async createForAccount(payload: AccountAdminPayload) {
		const accountData = await this.getAbilitiesOfAdmin(payload.sub)

		const { can, build } = new AbilityBuilder(
			createMongoAbility<PossibleAbilities, Conditions>
		)

		const featureNames = Object.keys(accountData.permissions) as AdminFeature[]
		featureNames.forEach(feature => {
			const scopes = accountData.permissions[feature as AdminFeature]

			switch (feature) {
				case AdminFeature.STORE:
					scopes.forEach(scope => {
						if ([Actions.MODIFY, Actions.ANALYSE].includes(scope)) {
							if (accountData.stores.length) {
								can(scope, Store, {
									_id: { $in: accountData.stores },
								})
							} else {
								can(scope, Store)
								can(scope, AdminFeature.STORE)
							}
						} else {
							can(scope, Store)
							can(scope, AdminFeature.STORE)
						}
					})
					break

				case AdminFeature.ORDER:
					scopes.forEach(scope => {
						if ([Actions.MODIFY, Actions.ANALYSE].includes(scope)) {
							if (accountData.stores.length) {
								can(scope, Order, {
									['store.id' as any]: { $in: accountData.stores },
								})
							} else {
								can(scope, Order)
								can(scope, AdminFeature.ORDER)
							}
						} else {
							can(scope, Order)
							can(scope, AdminFeature.ORDER)
						}
					})
					break

				default:
					scopes.forEach(scope => {
						can(scope, feature)
					})
					break
			}
		})

		return build({
			detectSubjectType: item =>
				item.constructor as ExtractSubjectType<Subjects>,
		})
	}

	async getAbilitiesOfAdmin(accountId: string) {
		const [accountData] = await this.accountAdminModel
			.aggregate<{
				id: Types.ObjectId
				stores: Types.ObjectId[]
				permissions: SelectedPermissionItem[]
			}>([
				{
					$match: {
						_id: new Types.ObjectId(accountId),
					},
				},
				{
					$lookup: {
						from: 'account_admin_roles',
						localField: 'roles',
						foreignField: '_id',
						as: 'roles',
						pipeline: [
							{
								$project: {
									permissions: true,
									_id: false,
								},
							},
						],
					},
				},
				{
					$project: {
						_id: false,
						id: '$_id',
						stores: true,
						permissions: {
							$reduce: {
								input: '$roles',
								initialValue: [],
								in: {
									$concatArrays: ['$$value', '$$this.permissions'],
								},
							},
						},
					},
				},
			])
			.exec()

		if (!accountData) {
			throw new BadRequestException('Account data not found')
		}

		const permissionMap = accountData.permissions.reduce(
			(result, permission) => {
				if (!result[permission.featureName]) {
					result[permission.featureName] = permission.scopes
				} else {
					result[permission.featureName] = uniq([
						...result[permission.featureName],
						...permission.scopes,
					])
				}

				return result
			},
			{} as Record<AdminFeature, Actions[]>
		)

		return { ...accountData, permissions: permissionMap }
	}
}
