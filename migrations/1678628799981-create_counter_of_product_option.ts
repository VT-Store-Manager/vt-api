// Orders is important, import your models bellow this two lines, NOT above
import { Counter, CounterSchema } from '../src/schemas/counter.schema'
import {
	ProductOption,
	ProductOptionSchema,
} from '../src/schemas/product-option.schema'
import mongoose from 'mongoose'
mongoose.set('strictQuery', false) // https://mongoosejs.com/docs/guide.html#strictQuery

// Import your models here

const counterModel = mongoose.model(Counter.name, CounterSchema)
const productOptionModel = mongoose.model(
	ProductOption.name,
	ProductOptionSchema
)

// Make any changes you need to make to the database here
export async function up() {
	await this.connect(mongoose)

	const maxCount =
		(
			await productOptionModel
				.find()
				.sort('-code')
				.select('code')
				.limit(1)
				.lean()
				.exec()
		)[0]?.code || 0
	await counterModel.create({
		collectionName: 'product_options',
		start: maxCount + 1,
		count: maxCount + 1,
	})
}

// Make any changes that UNDO the up function side effects here (if possible)
export async function down() {
	await this.connect(mongoose)

	await counterModel.deleteOne({ collectionName: 'product_options' })
}
