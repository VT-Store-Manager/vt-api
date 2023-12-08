import { capitalize } from 'lodash'
import { Namespace, Server } from 'socket.io'

import { SocketIoLogger, TaskScheduleLogger, WsNamespace } from '@app/common'
import {
	AllEventMap,
	MemberEventMap,
	ShipperEventMap,
	StoreEventMap,
	TokenPayload,
} from '@app/types'
import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import {
	AUTHENTICATED_USER_DATA,
	AUTHENTICATION_KEY,
} from '@sale/config/constant'

@Injectable()
export class WsConnectionService {
	server: Server<AllEventMap>
	memberNsp: Namespace<MemberEventMap>
	storeNsp: Namespace<StoreEventMap>
	shipperNsp: Namespace<ShipperEventMap>

	getMemberNsp(): Namespace<MemberEventMap> {
		if (!this.server) return null
		if (!this.memberNsp) {
			this.memberNsp = this.server.of(WsNamespace.MEMBER)
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

	@Cron('*/30 * * * * *')
	async checkExpiredClientsJob() {
		if (!this.server) return
		const socketsFromAllNamespaces = await Promise.all([
			this.server.fetchSockets(),
			this.getMemberNsp().fetchSockets(),
			this.getShipperNsp().fetchSockets(),
			this.getStoreNsp().fetchSockets(),
		])

		const now = Date.now() / 1000
		socketsFromAllNamespaces.forEach(sockets => {
			sockets.forEach(socket => {
				const authenticatedData: TokenPayload = socket[AUTHENTICATION_KEY]
				const userData = socket[AUTHENTICATED_USER_DATA]

				if (!authenticatedData || !authenticatedData.exp) return
				if (now < authenticatedData.exp) return

				SocketIoLogger.debug(
					`[${socket.id}] authentication expired: ${capitalize(
						userData.role
					)} - ${userData.name} - UID ${userData.id}`
				)

				delete socket[AUTHENTICATION_KEY]
				delete socket[AUTHENTICATED_USER_DATA]
				socket.rooms.clear()
				socket.emit('unauthorized')
			})
		})
	}
}
