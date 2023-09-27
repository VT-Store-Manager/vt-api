import {
	AdminAbility,
	CaslAbilityFactory,
} from '@admin/src/casl/casl-ability.factory'
import { PolicyHandler } from '@admin/types/casl'
import { AccountAdminPayload } from '@app/types'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator'
import { Types, isValidObjectId } from 'mongoose'
import { Order, Store } from '@app/database'

export type CaslAuthorizationObject = {
	storeId: string
}

@Injectable()
export class PoliciesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private caslAbilityFactory: CaslAbilityFactory
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const policyHandlers =
			this.reflector.get<PolicyHandler[]>(
				CHECK_POLICIES_KEY,
				context.getHandler()
			) || []

		const request = context.switchToHttp().getRequest()

		const user = request.user as AccountAdminPayload
		const caslObj: CaslAuthorizationObject = JSON.parse(
			request.headers['casl-authorization'] || '{}'
		)

		const ability = await this.caslAbilityFactory.createForAccount(user)

		return policyHandlers.every(handler =>
			this.execPolicyHandler(handler, ability, caslObj)
		)
	}

	private execPolicyHandler(
		handler: PolicyHandler,
		ability: AdminAbility,
		caslObj?: CaslAuthorizationObject
	) {
		const caslData = {
			store: (() => {
				const store = new Store()
				if (isValidObjectId(caslObj?.storeId)) {
					store._id = new Types.ObjectId(caslObj.storeId)
				} else {
					store._id = new Types.ObjectId()
				}
				return store
			})(),
			order: (() => {
				const order = new Order()
				if (isValidObjectId(caslObj?.storeId)) {
					order.store = {
						id: new Types.ObjectId(caslObj.storeId),
					} as any
				} else {
					order.store = {
						id: new Types.ObjectId(),
					} as any
				}
				return order
			})(),
		}

		if (typeof handler === 'function') {
			return handler(ability, caslData)
		}
		return handler.handle(ability, caslData)
	}
}
