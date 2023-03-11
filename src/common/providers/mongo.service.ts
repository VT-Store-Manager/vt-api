import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { ClientSession, Connection } from 'mongoose'

type MongoTransaction<T> = {
	transactionCb: (session: ClientSession) => Promise<T>
	doneCb?: () => Promise<any>
	errorCb?: (err?: any) => Promise<any>
}

@Injectable()
export class MongoService {
	constructor(@InjectConnection() private readonly connection: Connection) {}

	async transaction<T = any, R = any>(
		args: MongoTransaction<T>
	): Promise<{ result: R; err: any }> {
		let result, err
		try {
			const session = await this.connection.startSession()
			session.startTransaction()

			try {
				result = await args.transactionCb(session)
				await session.commitTransaction()
			} catch (error) {
				await session.abortTransaction()
				console.log(error)
				throw error
			}

			args.doneCb && (await args.doneCb())
			await session.endSession()
		} catch (error) {
			args.errorCb && (await args.errorCb(error))
			console.log(error)
			err = error
		}
		return { result, err }
	}
}
