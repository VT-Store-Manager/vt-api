import { FileService } from '@/app/modules/file/file.service'
import { SettingModule } from '@/app/modules/setting/setting.module'
import { MongoSessionService } from '@/common/providers/mongo-session.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MemberData, MemberDataSchema } from '@schema/member-data.schema'
import { Notification, NotificationSchema } from '@schema/notification.schema'
import { Order, OrderSchema } from '@schema/order.schema'

import { NotificationController } from './notification.controller'
import { NotificationService } from './notification.service'

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
	controllers: [NotificationController],
	providers: [NotificationService, FileService, MongoSessionService],
})
export class NotificationModule {}
