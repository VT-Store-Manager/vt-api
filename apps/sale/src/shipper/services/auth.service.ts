import { SoftDeleteModel } from 'mongoose-delete'

import { AppName, FileService, getListVnPhone } from '@app/common'
import { Shipper, ShipperDocument } from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Injectable()
export class ShipperAuthService {
	constructor(
		@InjectModel(Shipper.name)
		private readonly shipperModel: SoftDeleteModel<ShipperDocument>,
		private readonly fileService: FileService
	) {}

	async checkAccount(phone: string) {
		const countShipper = await this.shipperModel
			.count({ phone: { $in: getListVnPhone(phone) } })
			.orFail(
				new BadRequestException('Không tìm thấy tài xế dùng số điện thoại này')
			)
			.exec()

		return countShipper > 0
	}

	async getShipperId(phone: string): Promise<string> {
		const shipper = await this.shipperModel
			.findOne({ phone: { $in: getListVnPhone(phone) } })
			.orFail(
				new BadRequestException('Không tìm thấy tài xế dùng số điện thoại này')
			)
			.select('_id')
			.lean()
			.exec()

		return shipper._id.toString()
	}

	async getShipperInfo(shipperId: string) {
		return await this.shipperModel
			.findOne(
				{ _id: new Types.ObjectId(shipperId) },
				{
					_id: false,
					phone: true,
					name: true,
					avatar: this.fileService.getImageUrlExpression(
						'$avatar',
						undefined,
						AppName.SALE
					),
					gender: true,
					dob: { $toLong: '$dob' },
					numberPlate: true,
					createdAt: { $toLong: '$dob' },
				}
			)
			.orFail(new BadRequestException('Không tìm thấy tài xế'))
			.lean()
			.exec()
	}
}
