import { SoftDeleteModel } from 'mongoose-delete'

import { getListVnPhone } from '@app/common'
import { Shipper, ShipperDocument } from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class ShipperAuthService {
	constructor(
		@InjectModel(Shipper.name)
		private readonly shipperModel: SoftDeleteModel<ShipperDocument>
	) {}

	async checkAccount(phone: string) {
		const countShipper = await this.shipperModel
			.count({ phone: { $in: getListVnPhone(phone) } })
			.orFail(new BadRequestException('Phone number is incorrect'))
			.exec()

		return countShipper > 0
	}

	async getShipperId(phone: string): Promise<string> {
		const shipper = await this.shipperModel
			.findOne({ phone: { $in: getListVnPhone(phone) } })
			.orFail(new BadRequestException('Phone number is incorrect'))
			.select('_id')
			.lean()
			.exec()

		return shipper._id.toString()
	}
}
