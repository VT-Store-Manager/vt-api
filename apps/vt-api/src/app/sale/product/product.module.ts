import { Product, ProductSchema } from '@/database/schemas/product.schema'
import { Store, StoreSchema } from '@/database/schemas/store.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProductController } from './product.controller'
import { ProductService } from './product.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Product.name, schema: ProductSchema },
			{ name: Store.name, schema: StoreSchema },
		]),
	],
	controllers: [ProductController],
	providers: [ProductService],
})
export class ProductModule {}
