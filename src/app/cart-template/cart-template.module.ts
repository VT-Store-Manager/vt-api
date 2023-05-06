import {
	CartTemplate,
	CartTemplateSchema,
} from '@/schemas/cart-template.schema'
import { Product, ProductSchema } from '@/schemas/product.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CartTemplateMemberController } from './member-app/cart-template_member.controller'
import { CartTemplateMemberService } from './member-app/cart-template_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: CartTemplate.name, schema: CartTemplateSchema },
			{ name: Product.name, schema: ProductSchema },
		]),
	],
	controllers: [CartTemplateMemberController],
	providers: [CartTemplateMemberService],
})
export class CartTemplateModule {}
