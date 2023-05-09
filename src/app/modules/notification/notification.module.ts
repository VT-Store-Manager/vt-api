import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import { Notification, NotificationSchema } from '@schema/notification.schema'
import { Order, OrderSchema } from '@schema/order.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { FileService } from '../file/file.service'
import { SettingModule } from '../setting/setting.module'
import { NotificationAdminController } from './admin-app/notification_admin.controller'
import { NotificationAdminService } from './admin-app/notification_admin.service'
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
			{
				name: Order.name,
				schema: OrderSchema,
			},
		]),
		SettingModule,
	],
	controllers: [NotificationMemberController, NotificationAdminController],
	providers: [
		NotificationMemberService,
		NotificationAdminService,
		FileService,
		MongoSessionService,
	],
})
export class NotificationModule {}
