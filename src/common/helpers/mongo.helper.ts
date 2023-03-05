import { ClientSession, startSession } from 'mongoose'

type MongoSession = {
	transactionCb: (session: ClientSession) => any
	doneCb?: () => any
	errorCb?: (err?: any) => any
}

export const mongoSession = async ({
	transactionCb,
	doneCb,
	errorCb,
}: MongoSession) => {
	try {
		const session = await startSession()
		session.startTransaction()

		try {
			await transactionCb(session)
			await session.commitTransaction()
		} catch (error) {
			await session.abortTransaction()
			console.log(error)
			throw error
		}
		doneCb()
		await session.endSession()
	} catch (error) {
		errorCb(error)
		console.log(error)
	}
}
