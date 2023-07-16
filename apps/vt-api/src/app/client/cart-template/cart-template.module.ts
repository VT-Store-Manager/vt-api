import { SettingModule } from '@/app/modules/setting/setting.module'
import { MongoSessionService } from '@app/common'
import {
	CartTemplate,
	CartTemplateSchema,
	Product,
	ProductSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

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
