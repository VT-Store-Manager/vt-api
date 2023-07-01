import { Body, Controller, Get, Post } from '@nestjs/common'
import { AccountSaleService } from './account.service'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { BooleanResponseDTO } from '@/types/swagger'
import { LoginDTO } from './dto/login.dto'
import { TokenService } from '@/app/authentication/services/token.service'
import { Role } from '@/common/constants'
import {
	JwtAccess,
	JwtRefresh,
} from '@/app/authentication/decorators/jwt.decorator'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { TokenDTO } from '@/app/client/auth/dto/response.dto'
import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { UserPayload } from '@/types/token'

@Controller({
	path: 'sale/auth',
	version: '1',
})
@ApiTags('sale-app > auth')
export class AccountSaleController {
	constructor(
		private readonly accountSaleService: AccountSaleService,
		private readonly tokenService: TokenService
	) {}

	@Post('login')
	@ApiResponse({ type: BooleanResponseDTO })
	async login(@Body() body: LoginDTO) {
		const account = await this.accountSaleService.validateAccount(body)

		return this.tokenService.signToken({
			sub: account.store.toString(),
			role: Role.SALESPERSON,
		})
	}

	@Post('refresh')
	@JwtRefresh(Role.SALESPERSON)
	@ApiOperation({ summary: 'Get new access token and refresh token' })
	@ApiSuccessResponse(TokenDTO, 201)
	async refreshToken(@CurrentUser() user: UserPayload) {
		return await this.tokenService.signToken(user)
	}

	@Get('what-store')
	@JwtAccess()
	async whatStore(@CurrentUser('sub') storeId: string) {
		return await this.accountSaleService.getStore(storeId)
	}
}
