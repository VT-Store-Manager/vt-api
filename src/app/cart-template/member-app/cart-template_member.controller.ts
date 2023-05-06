import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CartTemplateMemberService } from './cart-template_member.service'

@Controller({
	path: 'member/cart-template',
	version: '1',
})
@ApiTags('member-app > cart-template')
export class CartTemplateMemberController {
	constructor(
		private readonly cartTemplateService: CartTemplateMemberService
	) {}
}
