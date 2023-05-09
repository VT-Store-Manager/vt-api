import { CounterModule } from '@module/counter/counter.module'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import {
	ProductOption,
	ProductOptionSchema,
} from '@schema/product-option.schema'
import { Product, ProductSchema } from '@schema/product.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ProductOptionAdminController } from './admin-app/product-option_admin.controller'
import { ProductOptionAdminService } from './admin-app/product-option_admin.service'
import { ProductOptionMemberController } from './member-app/product-option_member.controller'
import { ProductOptionMemberService } from './member-app/product-option_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ProductOption.name, schema: ProductOptionSchema },
			{ name: Product.name, schema: ProductSchema },
		]),
		CounterModule,
	],
	controllers: [ProductOptionAdminController, ProductOptionMemberController],
	providers: [
		ProductOptionAdminService,
		ProductOptionMemberService,
		MongoSessionService,
	],
	exports: [ProductOptionAdminService],
})
export class ProductOptionModule {}
