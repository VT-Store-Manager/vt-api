import {
	CartTemplate,
	CartTemplateSchema,
} from '@/schemas/cart-template.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CartTemplateMemberController } from './member-app/cart-template_member.controller'
import { CartTemplateMemberService } from './member-app/cart-template_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: CartTemplate.name, schema: CartTemplateSchema },
		]),
	],
	controllers: [CartTemplateMemberController],
	providers: [CartTemplateMemberService],
})
export class CartTemplateModule {}
