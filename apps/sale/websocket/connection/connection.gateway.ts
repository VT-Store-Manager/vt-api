import { capitalize } from 'lodash'
import { Namespace, Socket } from 'socket.io'

import {
	AuthService,
	CurrentClient,
	CurrentClientData,
	JwtAccessStrategy,
	WsAuth,
} from '@app/authentication'
import {
	getClientRoom,
	HTTP_HEADER_SECRET_KEY_NAME,
	Role,
	SocketIoLogger,
	WebsocketExceptionsFilter,
} from '@app/common'
import { CommonEventMap, CommonEventNames, TokenPayload } from '@app/types'
import {
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
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
} from '@nestjs/websockets'
import {
	AUTHENTICATED_USER_DATA,
	AUTHENTICATION_KEY,
	IS_HTTP_SERVER_KEY,
} from '@sale/config/constant'

import { WsConnectionService } from './connection.service'
import { AuthenticateClientDTO } from './dto/authenticate-client.dto'

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({ cors: '*', namespace: /.*/ })
export class ConnectionGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private connectionProvider: WsConnectionService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly jwtAccessStrategy: JwtAccessStrategy,
		private readonly authService: AuthService
	) {}

	@WebSocketServer()
	server: Namespace<CommonEventMap>

	afterInit(nsp: Namespace<CommonEventMap>) {
		this.connectionProvider.server = nsp.server
	}

	handleConnection(@ConnectedSocket() client: Socket) {
		this.authenticate(client)
		const isHttpServer = this.validateHttpServerClient(client)
		if (isHttpServer) {
			SocketIoLogger.debug(
				`[${client.id}] connected: HTTP Server - Namespace ${client.nsp.name}`
			)
			return
		}

		SocketIoLogger.debug(`[${client.id}] connected`)
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		const userData = client[AUTHENTICATED_USER_DATA]
		if (userData) {
			SocketIoLogger.debug(
				`[${client.id}] disconnected: ${capitalize(userData.role)} ${
					userData.name
				} - UID ${userData.id}`
			)
			return
		}

		const isHttpServer = client[IS_HTTP_SERVER_KEY]
		if (isHttpServer) {
			SocketIoLogger.debug(
				`[${client.id}] disconnected: HTTP Server - Namespace ${client.nsp.name}`
			)
			return
		}
		SocketIoLogger.debug(`[${client.id}] disconnected`)
	}

	@SubscribeMessage<CommonEventNames>('authenticate')
	async authenticateClient(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: AuthenticateClientDTO
	) {
		client.handshake.headers['authorization'] = body.token
		const authenticated = await this.authenticate(client)

		if (!authenticated) throw new UnauthorizedException()

		const authenticatedData: TokenPayload = client[AUTHENTICATION_KEY]
		const userData = client[AUTHENTICATED_USER_DATA]
		SocketIoLogger.debug(
			`[${client.id}] authenticated: ${capitalize(userData.role)} - ${
				userData.name
			} - UID ${userData.id} - expire at ${new Date(
				authenticatedData.exp * 1000
			).toLocaleString()}`
		)
	}

	@WsAuth()
	@SubscribeMessage<CommonEventNames>('check_authenticated')
	checkAuthenticated(
		@CurrentClient() auth: TokenPayload,
		@CurrentClientData() userData: any
	): WsResponse<TokenPayload> {
		SocketIoLogger.debug('Authenticated user data', userData)
		return { event: 'authenticated', data: auth }
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
				client.join(getClientRoom(role, payload.sub))
			})
		} else {
			client.join(getClientRoom(payload.role as Role, payload.sub))
		}

		client[AUTHENTICATION_KEY] = payload
		client[AUTHENTICATED_USER_DATA] =
			await this.authService.getAuthenticatedUser(
				payload.sub,
				payload.role as any
			)
		return true
	}

	private validateHttpServerClient(client: Socket): boolean {
		const clientHttpSecretKey =
			client.handshake.headers[HTTP_HEADER_SECRET_KEY_NAME] ||
			client.handshake.auth[HTTP_HEADER_SECRET_KEY_NAME]
		const secretKey = this.configService.get<string>('ws.httpSecret')

		const isHttpServer = clientHttpSecretKey === secretKey

		client[IS_HTTP_SERVER_KEY] = isHttpServer
		return isHttpServer
	}
}
