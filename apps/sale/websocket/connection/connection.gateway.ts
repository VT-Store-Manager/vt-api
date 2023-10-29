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
import { Types } from 'mongoose'

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({ cors: '*', namespace: /.*/ })
export class ConnectionGateway implements OnGatewayConnection {
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
		this.validateHttpServerClient(client)
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
				client.join(`${role}-${payload.sub}`)
			})
		} else {
			client.join(`${payload.role}-${payload.sub}`)
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
					}
				)
				.lean()
				.exec()
		} else if (roles.includes(Role.SALESPERSON)) {
			return await this.storeModel
				.findOne({ _id }, { id: { $toString: '$_id' }, _id: false, name: true })
				.lean()
				.exec()
		} else if (roles.includes(Role.SHIPPER)) {
			return await this.shipperModel
				.findOne({ _id }, { id: { $toString: '$_id' }, _id: false, name: true })
				.lean()
				.exec()
		} else if (roles.includes(Role.ADMIN)) {
			return await this.accountAdminModel
				.findOne({ _id }, { id: { $toString: '$_id' }, _id: false, name: true })
				.lean()
				.exec()
		}
	}

	private validateHttpServerClient(client: Socket): boolean {
		const clientHttpSecretKey =
			client.handshake.headers[HTTP_HEADER_SECRET_KEY_NAME]
		const secretKey = this.configService.get<string>('ws.httpSecret')

		const isHttpServer = clientHttpSecretKey === secretKey

		client[IS_HTTP_SERVER_KEY] = isHttpServer
		return isHttpServer
	}
}
