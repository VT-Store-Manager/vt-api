// Orders is important, import your models bellow this two lines, NOT above
import { Counter, CounterSchema } from '../src/schemas/counter.schema'
import {
	ProductCategory,
	ProductCategorySchema,
} from '../src/schemas/product-category.schema'
import mongoose from 'mongoose'
mongoose.set('strictQuery', false) // https://mongoosejs.com/docs/guide.html#strictQuery

// Import your models here
const counterModel = mongoose.model(Counter.name, CounterSchema)
const productCategoryModel = mongoose.model(
	ProductCategory.name,
	ProductCategorySchema
)

// Make any changes you need to make to the database here
export async function up() {
	await this.connect(mongoose)

	const [counter, categories] = await Promise.all([
		counterModel.findOne({ collectionName: 'product_categories' }),
		productCategoryModel.find().select('_id'),
	])
	let count = counter.start

	const _updateResult = await Promise.all(
		categories.map(category =>
			productCategoryModel.updateOne({ _id: category._id }, { code: count++ })
		)
	)
	const _updateCounter = await counterModel.updateOne(
		{ collectionName: 'product_categories' },
		{ count }
	)
}

// Make any changes that UNDO the up function side effects here (if possible)
export async function down() {
	await this.connect(mongoose)

	const _deletedIndex = await productCategoryModel.collection.dropIndex(
		'code_1'
	)

	const _updateCategories = await productCategoryModel.updateMany(
		{},
		{ $unset: { code: 1 } }
	)
}
