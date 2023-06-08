import { Module } from '@nestjs/common'

import { MemberVoucherModule } from './member-voucher/member-voucher.module'
import { NewsModule } from './news/news.module'

@Module({
	imports: [MemberVoucherModule, NewsModule],
})
export class AdminAppModule {}
