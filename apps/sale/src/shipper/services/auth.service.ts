import { Shipper, ShipperDocument } from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class ShipperAuthService {
	constructor(
		@InjectModel(Shipper.name)
		private readonly shipperModel: Model<ShipperDocument>
	) {}

	async checkAccount(phone: string) {
		const countShipper = await this.shipperModel
			.count({ phone, deleted: false })
			.orFail(new BadRequestException('Phone number is incorrect'))
			.exec()

		return countShipper > 0
	}

	async getShipperId(phone: string): Promise<string> {
		const shipper = await this.shipperModel
			.findOne({ phone, deleted: false })
			.orFail(new BadRequestException('Phone number is incorrect'))
			.select('_id')
			.lean()
			.exec()

		return shipper._id.toString()
	}
}
