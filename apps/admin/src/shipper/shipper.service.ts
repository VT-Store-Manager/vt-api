import { ClientSession } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Shipper, ShipperDocument } from '@app/database'
import { SoftDeleteModel } from 'mongoose-delete'
import { CreateShipperDTO } from './dto/create-shipper.dto'

@Injectable()
export class ShipperService {
	constructor(
		@InjectModel(Shipper.name)
		private readonly shipperModel: SoftDeleteModel<ShipperDocument>
	) {}

	async createShipper(
		data: CreateShipperDTO,
		session?: ClientSession
	): Promise<Shipper> {
		const [shipper] = await this.shipperModel.create(
			[
				{
					...data,
					avatar: typeof data.avatar === 'string' ? data.avatar : '',
					dob: new Date(data.dob),
				},
			],
			session ? { session } : {}
		)

		return shipper
	}
}
