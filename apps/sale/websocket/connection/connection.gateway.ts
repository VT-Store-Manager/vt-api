import { capitalize } from 'lodash'
import { Types } from 'mongoose'
import { SoftDeleteModel } from 'mongoose-delete'
import { Server, Socket } from 'socket.io'

import {
	CurrentClient,
	CurrentClientData,
	JwtAccessStrategy,
	WsAuth,
} from '@app/authentication'
import {
	HTTP_HEADER_SECRET_KEY_NAME,
	Role,
	WebsocketExceptionsFilter,
	getClientRoom,
} from '@app/common'
import {
	AccountAdmin,
	AccountAdminDocument,
	Member,
	MemberDocument,
	Shipper,
	ShipperDocument,
	Store,
	StoreDocument,
} from '@app/database'
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
import { InjectModel } from '@nestjs/mongoose'
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
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

import { AuthenticateClientDTO } from './dto/authenticate-client.dto'

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({ cors: '*', namespace: /.*/ })
export class ConnectionGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	private logger = new Logger('ConnectionGateway')

	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly jwtAccessStrategy: JwtAccessStrategy,
		@InjectModel(Member.name)
		private readonly memberModel: SoftDeleteModel<MemberDocument>,
		@InjectModel(Store.name)
		private readonly storeModel: SoftDeleteModel<StoreDocument>,
		@InjectModel(Shipper.name)
		private readonly shipperModel: SoftDeleteModel<ShipperDocument>,
		@InjectModel(AccountAdmin.name)
		private readonly accountAdminModel: SoftDeleteModel<AccountAdminDocument>
	) {}

	@WebSocketServer()
	server: Server

	handleConnection(@ConnectedSocket() client: Socket) {
		this.authenticate(client)
		const isHttpServer = this.validateHttpServerClient(client)
		if (isHttpServer) {
			this.logger.log(
				`HTTP Server ${client.id} (nsp: ${client.nsp.name}) connected`
			)
			return
		}

		this.logger.log(`Client ${client.id} connected`)
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		const userData = client[AUTHENTICATED_USER_DATA]
		if (userData) {
			this.logger.log(
				`${capitalize(userData.role)} ${client.id} - ${userData.name} - UID ${
					userData.id
				} disconnected`
			)
			return
		}

		const isHttpServer = client[IS_HTTP_SERVER_KEY]
		if (isHttpServer) {
			this.logger.log(
				`HTTP Server ${client.id} (nsp: ${client.nsp.name}) disconnected`
			)
			return
		}
		this.logger.log(`Client ${client.id} disconnected`)
	}

	@SubscribeMessage('authenticate')
	async authenticateClient(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: AuthenticateClientDTO
	) {
		client.handshake.headers['authorization'] = body.token
		const authenticated = await this.authenticate(client)
		if (!authenticated) throw new UnauthorizedException()
		const userData = client[AUTHENTICATED_USER_DATA]
		this.logger.log(
			`${capitalize(userData.role)} ${client.id} - ${userData.name} - UID ${
				userData.id
			} authenticated`
		)
	}

	@WsAuth()
	@SubscribeMessage('check_authenticated')
	checkAuthenticated(
		@CurrentClient() auth: TokenPayload,
		@CurrentClientData() userData: any
	): WsResponse<TokenPayload> {
		this.logger.log(userData)
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
		client[AUTHENTICATED_USER_DATA] = await this.getAuthenticatedUser(
			payload.sub,
			payload.role as any
		)
		return true
	}

	private async getAuthenticatedUser(id: string, role: Role | Role[]) {
		const roles: Role[] = Array.isArray(role) ? role : [role]

		const _id = new Types.ObjectId(id)

		if (roles.includes(Role.MEMBER)) {
			return await this.memberModel
				.findOne(
					{ _id },
					{
						id: { $toString: '$_id' },
						_id: false,
						name: { $concat: ['$firstName', ' ', '$lastName'] },
						role: Role.MEMBER,
					}
				)
				.lean()
				.exec()
		} else if (roles.includes(Role.SALESPERSON)) {
			return await this.storeModel
				.findOne(
					{ _id },
					{
						id: { $toString: '$_id' },
						_id: false,
						name: true,
						role: Role.SALESPERSON,
					}
				)
				.lean()
				.exec()
		} else if (roles.includes(Role.SHIPPER)) {
			return await this.shipperModel
				.findOne(
					{ _id },
					{
						id: { $toString: '$_id' },
						_id: false,
						name: true,
						role: Role.SHIPPER,
					}
				)
				.lean()
				.exec()
		} else if (roles.includes(Role.ADMIN)) {
			return await this.accountAdminModel
				.findOne(
					{ _id },
					{
						id: { $toString: '$_id' },
						_id: false,
						name: true,
						role: Role.ADMIN,
					}
				)
				.lean()
				.exec()
		}
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
