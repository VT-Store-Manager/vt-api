import { SmsService } from '@/providers/sms.service'
import { NoDataResponseDto } from '@/types/http.swagger'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { RegisterMemberDto } from '../dto/register-member.dto'
import { VerifySmsOtpDto } from '../dto/verify-sms-otp.dto'
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

	@Post('register')
	@ApiResponse({ type: NoDataResponseDto })
	async registerMember(@Body() dto: RegisterMemberDto) {
		const member = await this.authMemberService.createTemporaryMember(dto)
		if (member) {
			await this.smsService.initiatePhoneNumberVerification(dto.mobile)
		}
		return true
	}

	@Post('sms/verify')
	async verifySmsOtp(@Body() dto: VerifySmsOtpDto) {
		return await this.smsService.confirmPhoneNumber(dto.mobile, dto.code)
	}
}
