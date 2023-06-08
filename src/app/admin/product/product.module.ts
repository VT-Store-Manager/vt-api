import { CounterModule } from '@/app/modules/counter/counter.module'
import { FileService } from '@/app/modules/file/file.service'
import { ProductCategoryModule } from '@/app/modules/product-category/product-category.module'
import { ProductOptionModule } from '@/app/modules/product-option/product-option.module'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import { Member, MemberSchema } from '@schema/member.schema'
import { Product, ProductSchema } from '@schema/product.schema'
import { Store, StoreSchema } from '@schema/store.schema'

import { ProductController } from './product.controller'
import { ProductService } from './product.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Product.name, schema: ProductSchema },
			{ name: Member.name, schema: MemberSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: MemberData.name, schema: MemberDataSchema },
		]),
		ProductCategoryModule,
		ProductOptionModule,
		CounterModule,
	],
	controllers: [ProductController],
	providers: [ProductService, FileService, MongoSessionService],
	exports: [ProductService],
})
export class ProductModule {}
