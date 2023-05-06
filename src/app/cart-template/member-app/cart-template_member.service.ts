import { Model } from 'mongoose'

import {
	CartTemplate,
	CartTemplateDocument,
} from '@/schemas/cart-template.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class CartTemplateMemberService {
	constructor(
		@InjectModel(CartTemplate.name)
		private readonly cartTemplateModel: Model<CartTemplateDocument>
	) {}
}
