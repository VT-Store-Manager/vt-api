import { MomoModule } from '@app/common'
import { Module } from '@nestjs/common'

import { MomoController } from './controllers/momo.controller'

@Module({
	imports: [MomoModule],
	controllers: [MomoController],
})
export class PaymentModule {}
