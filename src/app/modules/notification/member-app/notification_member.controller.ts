import { Role } from '@/common/constants'
import { CurrentUser } from '@module/auth/decorators/current-user.decorator'
import { JwtAccess } from '@module/auth/decorators/jwt.decorator'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { NotificationMemberService } from './notification_member.service'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { MemberNotificationItemDTO } from './dto/response.dto'

@Controller({
	path: 'member/notification',
	version: '1',
})
@ApiTags('member-app > notification')
export class NotificationMemberController {
	constructor(
		private readonly notificationService: NotificationMemberService
	) {}

	@Get('all')
	@JwtAccess(Role.MEMBER)
	@ApiSuccessResponse(MemberNotificationItemDTO, 200, true)
	async getAllNotifications(
		@CurrentUser('sub') memberId: string
	): Promise<MemberNotificationItemDTO[]> {
		return await this.notificationService.getAll(memberId)
	}
}
