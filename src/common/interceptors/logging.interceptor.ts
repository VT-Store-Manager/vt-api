import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	intercept(
		context: ExecutionContext,
		next: CallHandler<any>
	): Observable<any> | Promise<Observable<any>> {
		const now = Date.now()
		return next
			.handle()
			.pipe(tap(() => console.log(`\nExecuted in ${Date.now() - now}ms`)))
	}
}
