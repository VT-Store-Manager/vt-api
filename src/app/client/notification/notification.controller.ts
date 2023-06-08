import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import { JwtAccess } from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { BooleanResponseDTO } from '@/types/swagger'
import { Controller, Get, Param, Patch } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { MemberNotificationItemDTO } from './dto/response.dto'
import { NotificationService } from './notification.service'

@Controller({
	path: 'member/notification',
	version: '1',
})
@ApiTags('member-app > notification')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

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

	@Patch('check-all')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO, status: 200 })
	async checkAllNotification(@CurrentUser('sub') memberId: string) {
		return await this.notificationService.checkAll(memberId)
	}
}
