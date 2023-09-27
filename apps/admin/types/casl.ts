import { Order, Store } from '@app/database'
import { AdminAbility } from '@admin/src/casl/casl-ability.factory'

export type CaslAuthorizationData = {
	store: Store
	order: Order
}

interface IPolicyHandler {
	handle(ability: AdminAbility, data?: CaslAuthorizationData): boolean
}

type PolicyHandlerCallback = (
	ability: AdminAbility,
	data?: CaslAuthorizationData
) => boolean

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback
