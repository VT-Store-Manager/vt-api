import { MemberData, MemberDataSchema } from '@/schemas/member-data.schema'
import { Notification, NotificationSchema } from '@/schemas/notification.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { NotificationMemberController } from './member-app/notification_member.controller'
import { NotificationMemberService } from './member-app/notification_member.service'

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: Notification.name,
				schema: NotificationSchema,
			},
			{
				name: MemberData.name,
				schema: MemberDataSchema,
			},
		]),
	],
	controllers: [NotificationMemberController],
	providers: [NotificationMemberService],
})
export class NotificationModule {}
