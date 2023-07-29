import { Server, Socket } from 'socket.io'

import { Logger, UseFilters } from '@nestjs/common'
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'

import { SOCKET_PORT } from '../../config/constant'
import { UserService } from '../user/user.service'
import { WebsocketExceptionsFilter } from '../../filter/ws-exception.filter'

@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway(SOCKET_PORT, { cors: '*' })
export class OnlineGateway implements OnGatewayConnection, OnGatewayDisconnect {
	private logger = new Logger('OnlineGateway')
	constructor(private readonly userService: UserService) {}
	@WebSocketServer()
	server: Server

	handleConnection(client: Socket) {
		const user = client.handshake.query
		client.join(user.id as any)
		this.logger.debug('Connected ' + user.id)
		client.broadcast.emit('user_online', user.id)
		client.emit(
			'online_list',
			Array.from(this.server.sockets.adapter.rooms.keys()).filter(key => {
				return (
					key &&
					key !== user.id &&
					Array.from(this.server.sockets.adapter.rooms.get(key).values())[0] !==
						key
				)
			})
		)
	}

	async handleDisconnect(client: Socket) {
		const userId = client.handshake.query.id
		this.logger.debug('Disconnected ' + userId)
		client.broadcast.emit('user_offline', userId)
	}
}
