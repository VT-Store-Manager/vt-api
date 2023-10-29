import { Server, Socket } from 'socket.io'

import { CurrentClient, JwtAccessStrategy, WsAuth } from '@app/authentication'
import { WebsocketExceptionsFilter } from '@app/common'
import { TokenPayload } from '@app/types'
import {
	Logger,
	UnauthorizedException,
	UseFilters,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
} from '@nestjs/websockets'
import { AUTHENTICATION_KEY, SOCKET_PORT } from '@sale/config/constant'

import { AuthenticateClientDTO } from './authenticate-client.dto'

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway(SOCKET_PORT, { cors: '*' })
export class MemberConnectionGateway implements OnGatewayConnection {
	private logger = new Logger('MemberConnectionGateway')

	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly jwtAccessStrategy: JwtAccessStrategy
	) {}

	@WebSocketServer()
	server: Server

	handleConnection(@ConnectedSocket() client: Socket) {
		this.authenticate(client)
	}

	@SubscribeMessage('authenticate')
	async authenticateClient(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: AuthenticateClientDTO
	) {
		client.handshake.headers['authorization'] = body.token
		const authenticated = await this.authenticate(client)
		if (!authenticated) throw new UnauthorizedException()
	}

	private async authenticate(client: Socket): Promise<boolean> {
		const token = client.handshake.headers['authorization']
		if (!token) return false

		let payload: TokenPayload
		try {
			payload = this.jwtService.verify<TokenPayload>(token, {
				secret: this.configService.get<string>('jwt.accessTokenSecret'),
			})
			const isValidUser = await this.jwtAccessStrategy.validate(payload)
			if (!isValidUser) {
				throw new Error()
			}
		} catch {
			delete client[AUTHENTICATION_KEY]
			return false
		}

		client.join(payload.sub)
		if (Array.isArray(payload.role)) {
			;(payload.role as []).forEach(role => {
				client.join(`${role}-${payload.sub}`)
			})
		} else {
			client.join(`${payload.role}-${payload.sub}`)
		}

		client[AUTHENTICATION_KEY] = payload
		return true
	}

	@WsAuth()
	@SubscribeMessage('check-authenticated')
	test(@CurrentClient() auth: TokenPayload): WsResponse<TokenPayload> {
		// eslint-disable-next-line no-console
		console.log('Client payload:', auth)
		return { event: 'authenticated', data: auth }
	}
}
