import { Server } from 'socket.io'

import { CurrentClient, WsAuth } from '@app/authentication'
import { WebsocketExceptionsFilter } from '@app/common'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
} from '@nestjs/websockets'
import { SOCKET_PORT } from '@sale/config/constant'

import { MemberNewOrderDTO } from './dto/member-new-order.dto'
import { TokenPayload } from '@/libs/types/src'

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway(SOCKET_PORT, { cors: '*' })
export class MemberOrderGateway {
	@WebSocketServer()
	server: Server

	@WsAuth()
	@SubscribeMessage('member-new_order')
	memberNewOrder(
		@CurrentClient() auth: TokenPayload,
		@MessageBody() body: MemberNewOrderDTO
	): WsResponse<MemberNewOrderDTO> {
		return { event: 'test', data: body }
	}
}
