import { Server } from 'socket.io'

import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'

import { SOCKET_PORT } from '../../config/constant'
import { UseFilters } from '@nestjs/common'
import { WebsocketExceptionsFilter } from '../../filter/ws-exception.filter'

export type Message = {
	id: string
	message: string
	time: number
}

@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway(SOCKET_PORT)
export class ChatGateway {
	@WebSocketServer()
	server: Server

	@SubscribeMessage('send_message')
	async handleSendMessage(@MessageBody() [roomId, message]: [string, Message]) {
		this.server.to(roomId).emit('receive_message', [message.id, message])
	}
}
