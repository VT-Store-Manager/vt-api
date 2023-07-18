import { FileService, SettingModule } from '@app/common'
import {
	MemberData,
	MemberDataSchema,
	MongoSessionService,
	Notification,
	NotificationSchema,
	Order,
	OrderSchema,
} from '@app/database'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

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
