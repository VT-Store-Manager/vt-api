import { MongoSessionService } from '@/providers/mongo/session.service'
import { Member, MemberSchema } from '@/schemas/member.schema'
import { Product, ProductSchema } from '@/schemas/product.schema'
import { Store, StoreSchema } from '@/schemas/store.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CounterModule } from '../counter/counter.module'
import { FileService } from '../file/file.service'
import { ProductCategoryModule } from '../product-category/product-category.module'
import { ProductOptionModule } from '../product-option/admin-app/product-option.module'
import { ProductAdminController } from './admin-app/product_admin.controller'
import { ProductAdminService } from './admin-app/product_admin.service'
import { ProductMemberController } from './member-app/product_member.controller'
import { ProductMemberService } from './member-app/product_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Product.name, schema: ProductSchema },
			{ name: Member.name, schema: MemberSchema },
			{ name: Store.name, schema: StoreSchema },
		]),
		ProductCategoryModule,
		ProductOptionModule,
		CounterModule,
	],
	controllers: [ProductAdminController, ProductMemberController],
	providers: [
		ProductAdminService,
		ProductMemberService,
		FileService,
		MongoSessionService,
	],
	exports: [ProductAdminService],
})
export class ProductModule {}
