import { Namespace, Server } from 'socket.io'

import { WsNamespace } from '@app/common'
import { MemberEventMap, ShipperEventMap, StoreEventMap } from '@app/types'
import { Injectable } from '@nestjs/common'

@Injectable()
export class ConnectionProvider {
	server: Server
	memberNsp: Namespace<MemberEventMap>
	storeNsp: Namespace<StoreEventMap>
	shipperNsp: Namespace<ShipperEventMap>

	getMemberNsp(): Namespace<MemberEventMap> {
		if (!this.server) return null
		if (!this.memberNsp) {
			this.memberNsp = this.server.of(WsNamespace.STORE)
		}
		return this.memberNsp
	}

	getStoreNsp(): Namespace<StoreEventMap> {
		if (!this.server) return null
		if (!this.storeNsp) {
			this.storeNsp = this.server.of(WsNamespace.STORE)
		}
		return this.storeNsp
	}

	getShipperNsp(): Namespace<ShipperEventMap> {
		if (!this.server) return null
		if (!this.shipperNsp) {
			this.shipperNsp = this.server.of(WsNamespace.SHIPPER)
		}
		return this.shipperNsp
	}
}
