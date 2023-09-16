import { AccountAdminPayload } from '@/libs/types/src'
import { TokenService } from '@app/authentication'
import { Role } from '@app/common'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { CurrentAdmin } from '../../authentication/decorators/current-admin.decorator'
import {
	JwtAccess,
	JwtRefresh,
} from '../../authentication/decorators/jwt.decorator'
import { LoginAdminDTO } from './dto/login.dto'

@Controller('admin/auth')
@ApiTags('admin-app > auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokenService
	) {}

	@Post('login')
	async loginAdmin(@Body() body: LoginAdminDTO) {
		const account = await this.authService.loginAdmin(body)

		const tokens = await this.tokenService.signToken(
			{ sub: account._id.toString() },
			{ type: Role.ADMIN }
		)

		return {
			tokens,
			user: {
				id: account._id.toString(),
				username: account.username,
				name: account.name,
				avatar: account.avatar,
				role: account.roles.map(role => role.name),
				updatePassword: !!account.forceUpdatePassword,
			},
		}
	}

	@Post('refresh')
	@JwtRefresh()
	async refresh(@CurrentAdmin() admin: AccountAdminPayload) {
		return await this.tokenService.signToken(admin, { type: Role.ADMIN })
	}

	@Get('check')
	@JwtAccess()
	async checkAuth(@CurrentAdmin() admin: AccountAdminPayload) {
		return admin
	}
}
