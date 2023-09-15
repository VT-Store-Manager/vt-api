import { TokenService } from '@app/authentication'
import {
	AccountAdmin,
	AccountAdminRole,
	AccountAdminRoleSchema,
	AccountAdminSchema,
	RefreshToken,
	RefreshTokenSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAccessAdminStrategy } from './strategies/jwt-access.strategy'
import { JwtRefreshAdminStrategy } from './strategies/jwt-refresh.strategy'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
			{ name: AccountAdminRole.name, schema: AccountAdminRoleSchema },
			{ name: RefreshToken.name, schema: RefreshTokenSchema },
		]),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		TokenService,
		JwtAccessAdminStrategy,
		JwtRefreshAdminStrategy,
		JwtService,
	],
})
export class AuthModule {}
