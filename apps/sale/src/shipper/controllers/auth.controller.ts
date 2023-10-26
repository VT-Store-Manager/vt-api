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
import { LoginDTO } from '../dto/login-shipper.dto'
import { ShipperAuthService } from '../services/auth.service'
import { VerifySmsOtpDTO } from '../dto/verify-sms-otp.dto'

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
		this.disableSMS = this.configService.get<boolean>('flag.disableSMS')
	}

	@Post('login')
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async sendVerification(@Body() { phone }: LoginDTO) {
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

	@Get('whoiam')
	@JwtAccess(Role.SHIPPER)
	@ApiSuccessResponse(UserPayload)
	async whoIAm(@CurrentUser() user: UserPayload) {
		return user
	}
}
