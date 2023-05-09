import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { CartTemplate, CartTemplateSchema } from '@schema/cart-template.schema'
import { Product, ProductSchema } from '@schema/product.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { SettingModule } from '../setting/setting.module'
import { CartTemplateMemberController } from './member-app/cart-template_member.controller'
import { CartTemplateMemberService } from './member-app/cart-template_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: CartTemplate.name, schema: CartTemplateSchema },
			{ name: Product.name, schema: ProductSchema },
		]),
		SettingModule,
	],
	controllers: [CartTemplateMemberController],
	providers: [CartTemplateMemberService, MongoSessionService],
})
export class CartTemplateModule {}
