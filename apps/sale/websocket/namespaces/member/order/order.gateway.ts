import { Server } from 'socket.io'

import { TokenPayload } from '@/libs/types/src'
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
import { WsNamespace } from '@sale/config/constant'

import { MemberNewOrderDTO } from './dto/member-new-order.dto'

@UseFilters(new WebsocketExceptionsFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({ cors: '*', namespace: WsNamespace.MEMBER })
export class MemberOrderGateway {
	@WebSocketServer()
	server: Server

	@WsAuth()
	@SubscribeMessage('new_order')
	memberNewOrder(
		@CurrentClient() auth: TokenPayload,
		@MessageBody() body: MemberNewOrderDTO
	): WsResponse<MemberNewOrderDTO> {
		return { event: 'test', data: body }
	}
}
