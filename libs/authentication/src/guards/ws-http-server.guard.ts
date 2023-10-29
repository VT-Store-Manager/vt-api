import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IS_HTTP_SERVER_KEY } from '@sale/config/constant'

@Injectable()
export class WsHttpServerGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const client = context.switchToWs().getClient()

		const isHttpServer = !!client[IS_HTTP_SERVER_KEY]

		if (!isHttpServer) {
			throw new ForbiddenException()
		}

		return isHttpServer
	}
}
