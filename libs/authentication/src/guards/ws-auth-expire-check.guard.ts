import { Socket } from 'socket.io'

import { TokenPayload } from '@app/types'
import {
	CanActivate,
	ExecutionContext,
	HttpException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { AUTHENTICATION_KEY } from '@sale/config/constant'
import { JwtAccessStrategy } from '../strategies/jwt-access.strategy'

@Injectable()
export class WsAuthExpireCheckGuard implements CanActivate {
	constructor(private readonly jwtAccessStrategy: JwtAccessStrategy) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client = context.switchToWs().getClient<Socket>()

		const authenticate: TokenPayload = client[AUTHENTICATION_KEY]

		try {
			await this.jwtAccessStrategy.validate(authenticate)
		} catch (exception) {
			const httpException: HttpException = exception
			if (httpException.message) {
				throw new UnauthorizedException(httpException.message)
			} else {
				throw new UnauthorizedException()
			}
		}

		return true
	}
}
