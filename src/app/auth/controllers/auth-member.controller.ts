import { SmsService } from '@/providers/sms.service'
import { NoDataResponseDTO } from '@/types/http.swagger'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { RegisterMemberDTO } from '../dto/register-member.dto'
import { LoginDTO } from '../dto/login.dto'
import { VerifySmsOtpDTO } from '../dto/verify-sms-otp.dto'
import { AuthMemberService } from '../services/auth-member.service'

@Controller({
	path: 'auth/member',
	version: '1',
})
@ApiTags('auth')
export class AuthMemberController {
	constructor(
		private readonly authMemberService: AuthMemberService,
		private readonly smsService: SmsService
	) {}

	@Post('login')
	async sendVerification(@Body() { mobile }: LoginDTO) {
		await this.authMemberService.checkAccount(mobile)
		await this.smsService.initiatePhoneNumberVerification(mobile)
		return true
	}

	@Post('register')
	@ApiResponse({ type: NoDataResponseDTO })
	async registerMember(@Body() dto: RegisterMemberDTO) {
		const member = await this.authMemberService.createTemporaryMember(dto)

		if (!member) return false

		await this.smsService.initiatePhoneNumberVerification(dto.mobile)
		return true
	}

	@Post('sms-verify')
	async verifySmsOtp(@Body() dto: VerifySmsOtpDTO) {
		await this.smsService.confirmPhoneNumber(dto.mobile, dto.code)
		const jwtPayload = await this.authMemberService.getJwtPayload(dto.mobile)
		return jwtPayload
	}
}
