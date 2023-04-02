import { MongoSessionService } from '@/providers/mongo/session.service'
import { NoDataResponseDTO } from '@/types/http.swagger'
import { AccessTokenPayload, RefreshTokenPayload } from '@/types/token.jwt'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { CurrentUser } from '../decorators/current-user.decorator'
import { JwtAccess, JwtRefresh } from '../decorators/jwt.decorator'
import { LoginDTO } from '../dto/login.dto'
import { RegisterMemberDTO } from '../dto/register-member.dto'
import { TokenDto } from '../dto/token.dto'
import { VerifySmsOtpDTO } from '../dto/verify-sms-otp.dto'
import { AuthMemberService } from './auth-member.service'
import { SmsService } from '../services/sms.service'
import { TokenService } from '../services/token.service'

@Controller({
	path: 'member/auth',
	version: '1',
})
@ApiTags('member-app > auth')
export class AuthMemberController {
	constructor(
		private readonly authMemberService: AuthMemberService,
		private readonly smsService: SmsService,
		private readonly tokenService: TokenService,
		private readonly mongoSessionService: MongoSessionService
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
		let tokens: TokenDto
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const jwtPayloadData =
					await this.authMemberService.getJwtPayloadByMobile(dto.mobile)
				await this.smsService.confirmPhoneNumber(dto.mobile, dto.code)
				tokens = await this.tokenService.signMemberToken(
					jwtPayloadData,
					session
				)
			}
		)
		if (error) throw error
		return tokens
	}

	@Post('refresh')
	@JwtRefresh()
	async refreshToken(@CurrentUser() user: RefreshTokenPayload) {
		const member = await this.authMemberService.getJwtPayload(user.uid)
		return await this.tokenService.signMemberToken(member)
	}

	@Get('whoiam')
	@JwtAccess()
	async whoIAm(@CurrentUser() user: AccessTokenPayload) {
		return user
	}
}
