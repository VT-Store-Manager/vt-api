import { SoftDeleteModel } from 'mongoose-delete'

import {
	AdminRequestService,
	AppName,
	FileService,
	SettingSaleService,
	getListVnPhone,
} from '@app/common'
import { SettingSaleApp, Shipper, ShipperDocument } from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Injectable()
export class ShipperAuthService {
	constructor(
		@InjectModel(Shipper.name)
		private readonly shipperModel: SoftDeleteModel<ShipperDocument>,
		private readonly fileService: FileService,
		private readonly saleSettingService: SettingSaleService,
		private readonly adminRequestService: AdminRequestService
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

	async createWithdrawRequest(shipperId: string) {
		const [saleSetting, shipper] = await Promise.all([
			this.saleSettingService.getData<Pick<SettingSaleApp, 'shipper'>>({
				shipper: true,
			}),
			this.shipperModel
				.findOne({ _id: new Types.ObjectId(shipperId) }, { wallet: true })
				.orFail(new BadRequestException('Không tìm thấy tài xế'))
				.lean()
				.exec(),
		])
		if (
			saleSetting.shipper?.minWithdraw &&
			shipper.wallet < saleSetting.shipper.minWithdraw
		) {
			throw new BadRequestException(
				`Ví tiền chưa đạt mức tối thiểu (${saleSetting.shipper.minWithdraw.toLocaleString()}đ)`
			)
		}
		await this.adminRequestService.create({
			targetId: shipperId,
			targetType: 'shipper',
			requestType: 'withdraw',
			priority: 'high',
		})
		return true
	}
}
