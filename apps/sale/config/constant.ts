import { Logger } from '@nestjs/common'

export const AUTHENTICATION_KEY = 'authenticate'
export const AUTHENTICATED_USER_DATA = 'user'
export const IS_HTTP_SERVER_KEY = 'isHttpServer'

export const socketLogger = new Logger('SocketIO')
