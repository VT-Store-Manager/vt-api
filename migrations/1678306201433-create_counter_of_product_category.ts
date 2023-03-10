// Orders is important, import your models bellow this two lines, NOT above
import { Counter, CounterSchema } from '../src/schemas/counter.schema'
import mongoose from 'mongoose'
mongoose.set('strictQuery', false) // https://mongoosejs.com/docs/guide.html#strictQuery

// Import your models here

const counterModel = mongoose.model(Counter.name, CounterSchema)

// Make any changes you need to make to the database here
export async function up() {
	await this.connect(mongoose)

	const start = 1
	await counterModel.create({
		collectionName: 'product_categories',
		start,
		count: start,
	})
}

// Make any changes that UNDO the up function side effects here (if possible)
export async function down() {
	await this.connect(mongoose)

	await counterModel.deleteOne({ collectionName: 'product_categories' })
}
