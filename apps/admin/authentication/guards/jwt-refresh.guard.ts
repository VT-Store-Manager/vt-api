import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtRefreshAdminGuard extends AuthGuard('jwt-refresh-admin') {}
