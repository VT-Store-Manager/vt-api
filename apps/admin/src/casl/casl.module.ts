import {
	AccountAdmin,
	AccountAdminSchema,
	Order,
	OrderSchema,
	Store,
	StoreSchema,
} from '@app/database'
import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { CaslAbilityFactory } from './casl-ability.factory'

@Global()
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AccountAdmin.name, schema: AccountAdminSchema },
			{ name: Store.name, schema: StoreSchema },
			{ name: Order.name, schema: OrderSchema },
		]),
	],
	providers: [CaslAbilityFactory],
	exports: [CaslAbilityFactory],
})
export class CaslModule {}
