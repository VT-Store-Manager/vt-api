import { Logger } from '@nestjs/common'
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway(8083)
export class ChatGateway implements OnGatewayConnection {
	@WebSocketServer()
	server: Server

	handleConnection(client: Socket) {
		console.log(client.id)
		console.log(this.server.sockets)
		this.server.sockets.emit('connected', client.id)
	}

	@SubscribeMessage('events')
	handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
		Logger.debug(client.id)
	}

	@SubscribeMessage('send_message')
	listenForMessages(@MessageBody() data: string) {
		this.server.sockets.emit('receive_message', data)
	}
}
