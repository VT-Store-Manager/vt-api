import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { CartTemplateModule } from './cart-template/cart-template.module'
import { MemberDataModule } from './member-data/member-data.module'
import { MemberRankModule } from './member-rank/member-rank.module'
import { MemberModule } from './member/member.module'

@Module({
	imports: [
		AuthModule,
		CartTemplateModule,
		MemberModule,
		MemberDataModule,
		MemberRankModule,
	],
})
export class ClientAppModule {}
