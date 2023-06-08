import { Module } from '@nestjs/common'

import { MemberVoucherModule } from './member-voucher/member-voucher.module'
import { NewsModule } from './news/news.module'
import { NotificationModule } from './notification/notification.module'

@Module({
	imports: [MemberVoucherModule, NewsModule, NotificationModule],
})
export class AdminAppModule {}
