import { io, Socket } from 'socket.io-client'
import { DisconnectDescription } from 'socket.io-client/build/esm/socket'

import {
	HTTP_HEADER_SECRET_KEY_NAME,
	SocketIoLogger,
	WsNamespace,
} from '@app/common'
import { MemberEventMap } from '@app/types'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MemberServerSocketClientService {
	constructor(private readonly configService: ConfigService) {
		this.connect()
	}

	private socket: Socket<MemberEventMap>

	private connect() {
		this.socket = io(
			this.configService.get<string>('ws.host') + '/' + WsNamespace.MEMBER,
			{
				auth: {
					[HTTP_HEADER_SECRET_KEY_NAME]:
						this.configService.get<string>('ws.httpSecret'),
				},
			}
		)
		this.socket.on('connect', () => {
			SocketIoLogger.log('Socket-client connected')
		})
		this.socket.on(
			'disconnect',
			(
				reason: Socket.DisconnectReason,
				description?: DisconnectDescription
			) => {
				reason
				SocketIoLogger.warn(
					'Socket-client disconnected' +
						`: ${reason} - ${
							(description as Error)?.message ||
							(description as any)?.description
						}`
				)
			}
		)
		this.socket.on('connect_error', (err: Error) => {
			SocketIoLogger.error('Socket connection occurs error', err.stack)
		})
		this.socket.on('error', (err: Error) => {
			SocketIoLogger.error(`${err.name} - ${err.message}`)
		})
	}

	getSocket() {
		if (!this.socket) {
			this.connect()
		}
		if (!this.socket.connect) {
			this.socket.connect()
		}
		return this.socket
	}
}
