import { ApiSuccessResponse, Role } from '@app/common'
import { BooleanResponseDTO, UserPayload } from '@app/types'
import {
	CurrentUser,
	JwtAccess,
	JwtRefresh,
	SmsService,
	TokenService,
} from '@app/authentication'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { TokenDTO } from '../../auth/dto/token.dto'
import { LoginShipperDTO } from '../dto/login-shipper.dto'
import { ShipperAuthService } from '../services/auth.service'
import { VerifySmsOtpDTO } from '../dto/verify-sms-otp.dto'
import { RequestWithdrawItem, ShipperInfoDTO } from '../dto/response.dto'
import { RequestWithdrawDTO } from '../dto/request-withdraw.dto'

@Controller('shipper/auth')
@ApiTags('shipper-app > auth')
export class ShipperAuthController {
	private disableSMS: boolean
	constructor(
		private readonly configService: ConfigService,
		private readonly authService: ShipperAuthService,
		private readonly smsService: SmsService,
		private readonly tokenService: TokenService
	) {
		this.disableSMS = this.configService.get<boolean>('dev.disableSmsFlag')
	}

	@Post('login')
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async sendVerification(@Body() { phone }: LoginShipperDTO) {
		await this.authService.checkAccount(phone)
		if (!this.disableSMS) {
			await this.smsService.initiatePhoneNumberVerification(phone)
		}
		return true
	}

	@Post('sms-verify')
	@ApiSuccessResponse(TokenDTO, 201)
	async verifySmsOtp(@Body() dto: VerifySmsOtpDTO) {
		const [shipperId, _] = await Promise.all([
			this.authService.getShipperId(dto.phone),
			this.disableSMS
				? null
				: this.smsService.confirmPhoneNumber(dto.phone, dto.code),
		])
		const tokens = await this.tokenService.signToken({
			role: Role.SHIPPER,
			sub: shipperId,
		})

		return tokens
	}

	@Post('refresh')
	@JwtRefresh(Role.SHIPPER)
	@ApiSuccessResponse(TokenDTO, 201)
	async refreshToken(@CurrentUser() user: UserPayload) {
		return await this.tokenService.signToken(user)
	}

	@Get('info')
	@JwtAccess(Role.SHIPPER)
	@ApiSuccessResponse(ShipperInfoDTO)
	async whoIAm(@CurrentUser() user: UserPayload) {
		return await this.authService.getShipperInfo(user.sub)
	}

	@Post('request-withdraw')
	@JwtAccess(Role.SHIPPER)
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async requestWithdraw(
		@CurrentUser('sub') shipperId: string,
		@Body() body: RequestWithdrawDTO
	) {
		return await this.authService.createWithdrawRequest(shipperId, body)
	}

	@Get('withdraw-history')
	@JwtAccess(Role.SHIPPER)
	@ApiSuccessResponse(RequestWithdrawItem, 200, true)
	async getWithdrawHistory(@CurrentUser('sub') shipperId: string) {
		return await this.authService.getWithdrawHistory(shipperId)
	}
}
