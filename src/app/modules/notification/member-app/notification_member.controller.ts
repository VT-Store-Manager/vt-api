import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { NotificationMemberService } from './notification_member.service'

@Controller({
	path: 'member/notification',
	version: '1',
})
@ApiTags('member-app > notification')
export class NotificationMemberController {
	constructor(
		private readonly notificationService: NotificationMemberService
	) {}
}
