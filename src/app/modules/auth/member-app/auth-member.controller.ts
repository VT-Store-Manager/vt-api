import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { BooleanResponseDTO } from '@/types/swagger'
import { UserPayload } from '@/types/token'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CurrentUser } from '../decorators/current-user.decorator'
import { JwtAccess, JwtRefresh } from '../decorators/jwt.decorator'
import { LoginDTO } from '../dto/login.dto'
import { RegisterMemberDTO } from '../dto/register-member.dto'
import { TokenDTO } from '../dto/response.dto'
import { VerifySmsOtpDTO } from '../dto/verify-sms-otp.dto'
import { SmsService } from '../services/sms.service'
import { TokenService } from '../services/token.service'
import { AuthMemberService } from './auth-member.service'

@Controller({
	path: 'member/auth',
	version: '1',
})
@ApiTags('member-app > auth')
export class AuthMemberController {
	private disableSMS: boolean
	constructor(
		private readonly authMemberService: AuthMemberService,
		private readonly configService: ConfigService,
		private readonly smsService: SmsService,
		private readonly tokenService: TokenService,
		private readonly mongoSessionService: MongoSessionService
	) {
		this.disableSMS = this.configService.get<boolean>('flag.disableSMS')
	}

	@Post('login')
	@ApiOperation({ summary: 'Get OTP by phone number' })
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	async sendVerification(@Body() { phone }: LoginDTO) {
		await this.authMemberService.checkAccount(phone)
		if (!this.disableSMS) {
			await this.smsService.initiatePhoneNumberVerification(phone)
		}
		return true
	}

	@Post('register')
	@ApiResponse({ type: BooleanResponseDTO, status: 201 })
	@ApiOperation({
		summary:
			'Register temporary account and get OTP to verify. Temporary account will destroy after 10 min',
	})
	async registerMember(@Body() dto: RegisterMemberDTO) {
		const member = await this.authMemberService.createTemporaryMember(dto)

		if (!member) return false
		if (!this.disableSMS) {
			await this.smsService.initiatePhoneNumberVerification(dto.phone)
		}
		return true
	}

	@Post('sms-verify')
	@ApiSuccessResponse(TokenDTO, 201)
	@ApiOperation({ summary: 'Verify OTP and get tokens' })
	async verifySmsOtp(@Body() dto: VerifySmsOtpDTO) {
		let tokens: TokenDTO
		const { error } = await this.mongoSessionService.execTransaction(
			async session => {
				const [memberId, _] = await Promise.all([
					this.authMemberService.initMemberData(dto.phone, session),
					this.disableSMS
						? null
						: this.smsService.confirmPhoneNumber(dto.phone, dto.code),
				])
				tokens = await this.tokenService.signMemberToken(
					{ role: Role.MEMBER, sub: memberId },
					session
				)
			}
		)
		if (error) throw error
		return tokens
	}

	@Post('refresh')
	@JwtRefresh(Role.MEMBER)
	@ApiOperation({ summary: 'Get new access token and refresh token' })
	@ApiSuccessResponse(TokenDTO, 201)
	async refreshToken(@CurrentUser() user: UserPayload) {
		return await this.tokenService.signMemberToken(user)
	}

	@Get('whoiam')
	@JwtAccess()
	@ApiOperation({ summary: 'Test authenticating with token' })
	@ApiSuccessResponse(UserPayload)
	async whoIAm(@CurrentUser() user: UserPayload) {
		return user
	}
}
