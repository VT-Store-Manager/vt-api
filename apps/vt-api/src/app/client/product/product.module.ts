import { ProductCategoryModule } from '@/app/admin/product-category/product-category.module'
import { ProductOptionModule } from '@/app/admin/product-option/product-option.module'
import { CounterModule } from '@/app/modules/counter/counter.module'
import { FileService } from '@/app/modules/file/file.service'
import { MongoSessionService } from '@app/common'
import {
	Member,
	MemberData,
	MemberDataSchema,
	MemberSchema,
	Product,
	ProductSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ProductMemberController } from './product.controller'
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
	controllers: [ProductMemberController],
	providers: [ProductService, FileService, MongoSessionService],
})
export class ProductModule {}
