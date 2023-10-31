import { io, Socket } from 'socket.io-client'

import { HTTP_HEADER_SECRET_KEY_NAME, WsNamespace } from '@app/common'
import { MemberEventMap } from '@app/types'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MemberSocketClientService {
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
	}

	getSocket() {
		if (!this.socket) {
			this.connect()
		}
		return this.socket
	}
}
