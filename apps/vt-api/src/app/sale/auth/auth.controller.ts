import { TokenDTO } from '@/app/client/auth/dto/response.dto'
import {
	CurrentUser,
	JwtAccess,
	JwtRefresh,
	TokenService,
} from '@app/authentication'
import { ApiSuccessResponse, Role } from '@app/common'
import { BooleanResponseDTO, UserPayload } from '@app/types'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { LoginDTO } from './dto/login.dto'

@Controller({
	path: 'sale/auth',
	version: '1',
})
@ApiTags('sale-app > auth')
export class AuthController {
	constructor(
		private readonly accountSaleService: AuthService,
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
