import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { CartTemplate, CartTemplateSchema } from '@schema/cart-template.schema'
import { Product, ProductSchema } from '@schema/product.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SettingModule } from '@/app/modules/setting/setting.module'
import { CartTemplateController } from './cart-template.controller'
import { CartTemplateService } from './cart-template.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: CartTemplate.name, schema: CartTemplateSchema },
			{ name: Product.name, schema: ProductSchema },
		]),
		SettingModule,
	],
	controllers: [CartTemplateController],
	providers: [CartTemplateService, MongoSessionService],
})
export class CartTemplateModule {}
