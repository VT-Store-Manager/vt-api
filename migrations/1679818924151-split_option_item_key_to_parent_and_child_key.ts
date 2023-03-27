// Orders is important, import your models bellow this two lines, NOT above
import {
	ProductOption,
	ProductOptionSchema,
} from '../src/schemas/product-option.schema'
import mongoose from 'mongoose'
import { ensureTransactionCompletion } from './helpers/mongo-session'
import { ClientSession } from 'mongoose'
mongoose.set('strictQuery', false) // https://mongoosejs.com/docs/guide.html#strictQuery

// Import your models here
const productOptionModel = mongoose.model(
	ProductOption.name,
	ProductOptionSchema
)

// Make any changes you need to make to the database here
export async function up() {
	await this.connect(mongoose)
	// Write migration here
	const session = await mongoose.startSession()

	const options = await productOptionModel
		.find({ parent: { $exists: true, $ne: null } })
		.select('parent items')
		.lean()
		.exec()

	await session.withTransaction(
		async (transSession: ClientSession) => {
			await Promise.all(
				options.map(option => {
					const items = option.items.map(item => {
						const keys = item.key.split('-')
						return {
							...item,
							parentKey: keys[0],
							key: keys[1],
						}
					})
					return productOptionModel.updateOne(
						{ _id: option._id },
						{
							items,
						},
						{ session: transSession }
					)
				})
			)
		},
		{ maxCommitTimeMS: 10000 }
	)
	await ensureTransactionCompletion(session)

	await session.endSession()
}

// Make any changes that UNDO the up function side effects here (if possible)
export async function down() {
	await this.connect(mongoose)
	// Write migration here
	const session = await mongoose.startSession()

	const options = await productOptionModel
		.find({ parent: { $exists: true, $ne: null } })
		.select('parent items')
		.lean()
		.exec()

	await session.withTransaction(
		async (transSession: ClientSession) => {
			await Promise.all(
				options.map(option => {
					const items = option.items.map(item => {
						const key = item.parentKey + '-' + item.key
						delete item.parentKey
						return {
							...item,
							key,
						}
					})
					return productOptionModel.updateOne(
						{ _id: option._id },
						{
							items,
						},
						{ session: transSession }
					)
				})
			)
		},
		{ maxCommitTimeMS: 10000 }
	)
	await ensureTransactionCompletion(session)

	await session.endSession()
}
