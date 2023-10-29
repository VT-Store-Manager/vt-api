import { Socket } from 'socket.io'

import { TokenPayload } from '@app/types'
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { AUTHENTICATION_KEY } from '@sale/config/constant'

@Injectable()
export class WsAuthExpireCheckGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client = context.switchToWs().getClient<Socket>()

		const authenticate: TokenPayload = client[AUTHENTICATION_KEY]

		if (!authenticate) {
			throw new UnauthorizedException()
		}

		if (authenticate.exp && authenticate.exp < Date.now() / 1000) {
			throw new UnauthorizedException()
		}

		return true
	}
}
