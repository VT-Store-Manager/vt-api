import { Request, Response } from 'express'
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
		const code = context.switchToHttp().getResponse<Response>().statusCode

		if (['OPTIONS', 'HEAD', 'DELETE'].includes(requestMethod))
			return next.handle()

		return next.handle().pipe(
			map(data => {
				if (typeof data === 'string') {
					return { statusCode: code, message: data }
				}
				if (typeof data === 'object' && (data?.data || data?.message)) {
					return {
						statusCode: code,
						data: data?.data,
						message: data?.message,
					}
				}
				if (typeof data === 'boolean') {
					return {
						statusCode: code,
						success: data,
					}
				}
				return { statusCode: code, data }
			})
		)
	}
}
