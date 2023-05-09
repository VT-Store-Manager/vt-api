import { ClientSession } from 'mongoose'

export async function ensureTransactionCompletion(
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
