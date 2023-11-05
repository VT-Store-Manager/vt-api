import { DynamicModule, Module, Provider } from '@nestjs/common'

import { MemberServerSocketClientService } from './member-client.service'
import { StoreSocketClientService } from './store-client.service'
import { WsNamespace } from '../../constants'

@Module({})
export class SocketClientModule {
	static register(...namespaces: WsNamespace[]): DynamicModule {
		const providerSet = new Set<Provider>()

		if (namespaces.includes(WsNamespace.MEMBER)) {
			providerSet.add(MemberServerSocketClientService)
		}
		if (namespaces.includes(WsNamespace.STORE)) {
			providerSet.add(StoreSocketClientService)
		}
		if (namespaces.length === 0) {
			providerSet.add(MemberServerSocketClientService)
			providerSet.add(StoreSocketClientService)
		}

		const providers = Array.from(providerSet)

		return {
			module: SocketClientModule,
			providers,
			exports: providers,
		}
	}
}
