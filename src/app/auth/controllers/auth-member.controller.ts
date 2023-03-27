import { NoDataResponseDto } from '@/types/http.swagger'
import { Body, Controller, Post } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { RegisterMemberDto } from '../dto/register-member.dto'
import { AuthMemberService } from '../services/auth-member.service'

@Controller({
	path: 'auth/member',
	version: '1',
})
@ApiTags('auth')
export class AuthMemberController {
	constructor(private readonly authMemberService: AuthMemberService) {}

	@Post('register')
	@ApiResponse({ type: NoDataResponseDto })
	async registerMember(@Body() dto: RegisterMemberDto) {
		return await this.authMemberService.createTemporaryMember(dto)
	}
}
