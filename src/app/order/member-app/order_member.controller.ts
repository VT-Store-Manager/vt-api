import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccess } from '@/app/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { UserPayload } from '@/types/token.dto'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { CheckVoucherDTO } from './dto/check-voucher.dto'
import { GetProductPriceApplyingVoucherDTO } from './dto/response.dto'
import { OrderMemberService } from './order_member.service'

@Controller({
	path: 'member/cart',
	version: '1',
})
@ApiTags('member-app > cart')
export class OrderMemberController {
	constructor(private readonly orderService: OrderMemberService) {}

	@Post('check-voucher')
	@JwtAccess(Role.MEMBER)
	async checkVoucherForApply(
		@CurrentUser() user: UserPayload,
		@Body() body: CheckVoucherDTO
	): Promise<GetProductPriceApplyingVoucherDTO> {
		const applyVoucherResult = await this.orderService.checkVoucher(
			user.sub,
			body
		)
		return {
			fee:
				applyVoucherResult.deliveryPrice - applyVoucherResult.deliverySalePrice,
			cost: applyVoucherResult.products.reduce((res, product) => {
				const productPrice =
					product.quantity * (product.mainPrice + product.extraPrice) -
					product.discountPrice
				return res + productPrice
			}, 0),
			voucherDiscount:
				applyVoucherResult.totalDiscount ||
				applyVoucherResult.products.reduce((res, product) => {
					return res + product.discountPrice
				}, 0),
			products: applyVoucherResult.products.map(product => ({
				id: product.id,
				cost: (product.mainPrice + product.extraPrice) * product.quantity,
			})),
		}
	}
}