import { Request } from 'express'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common'

@Injectable()
export class TransformInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<any> | Promise<Observable<any>> {
		const requestMethod = context.switchToHttp().getRequest<Request>().method

		if (['OPTIONS', 'HEAD', 'DELETE'].includes(requestMethod))
			return next.handle()

		return next.handle().pipe(
			map(data => {
				if (typeof data === 'string') {
					return { message: data }
				}
				if (typeof data === 'object' && (data?.data || data?.message)) {
					return {
						data: data?.data,
						message: data?.message,
					}
				}
				return { data }
			})
		)
	}
}
