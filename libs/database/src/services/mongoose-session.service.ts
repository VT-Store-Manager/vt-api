import { Document, MongoError } from 'mongodb'
import { ClientSession, Connection } from 'mongoose'

import { HttpException, Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'

@Injectable()
export class MongoSessionService {
	constructor(@InjectConnection() private readonly connection: Connection) {}

	async execTransaction<T = any>(
		fn: (session: ClientSession) => Promise<T>
	): Promise<{ result: Document; error: Error | MongoError | HttpException }> {
		try {
			const session = await this.connection.startSession()

			const result = await session.withTransaction<T>(fn, {
				maxCommitTimeMS: 10000,
			})

			await this.ensureTransactionCompletion(session)
			await session.endSession()

			return {
				result: result,
				error: null,
			}
		} catch (error) {
			return {
				result: undefined,
				error: error,
			}
		}
	}

	private async ensureTransactionCompletion(
		session: ClientSession,
		maxRetryCount = 50
	) {
		let count = 0
		while (session.inTransaction()) {
			if (count >= maxRetryCount) {
				break
			}

			await new Promise(r => setTimeout(r, 100))
			count++
		}
	}
}
