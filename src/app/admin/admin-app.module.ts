import { Module } from '@nestjs/common'

import { MemberVoucherModule } from './member-voucher/member-voucher.module'
import { NewsModule } from './news/news.module'
import { NotificationModule } from './notification/notification.module'
import { PartnerModule } from './partner/partner.module'

@Module({
	imports: [MemberVoucherModule, NewsModule, NotificationModule, PartnerModule],
})
export class AdminAppModule {}
