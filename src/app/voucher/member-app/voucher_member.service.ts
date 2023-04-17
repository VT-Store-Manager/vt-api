import { Model } from 'mongoose'

import { Voucher, VoucherDocument } from '@/schemas/voucher.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class VoucherMemberService {
	constructor(
		@InjectModel(Voucher.name)
		private readonly voucherModel: Model<VoucherDocument>
	) {}
}
