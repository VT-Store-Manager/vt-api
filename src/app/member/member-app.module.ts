import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { CartTemplateModule } from './cart-template/cart-template.module'

@Module({
	imports: [AuthModule, CartTemplateModule],
})
export class MemberAppModule {}
