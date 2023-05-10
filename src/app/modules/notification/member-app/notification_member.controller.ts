import { Role } from '@/common/constants'
import { CurrentUser } from '@module/auth/decorators/current-user.decorator'
import { JwtAccess } from '@module/auth/decorators/jwt.decorator'
import { Controller, Get, Param, Patch } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { NotificationMemberService } from './notification_member.service'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { MemberNotificationItemDTO } from './dto/response.dto'
import { BooleanResponseDTO } from '@/types/swagger'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'

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

	@Patch(':notificationId/check')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async checkNotification(
		@CurrentUser('sub') memberId: string,
		@Param('notificationId', ObjectIdPipe) notificationId: string
	) {
		return await this.notificationService.check(memberId, notificationId)
	}
}
