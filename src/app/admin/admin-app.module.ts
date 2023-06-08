import { Module } from '@nestjs/common'
import { MemberVoucherModule } from './member-voucher/member-voucher.module'

@Module({
	imports: [MemberVoucherModule],
})
export class AdminAppModule {}
