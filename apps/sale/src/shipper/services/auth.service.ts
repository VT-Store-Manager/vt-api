import { SoftDeleteModel } from 'mongoose-delete'

import {
	AdminRequestService,
	AppName,
	FileService,
	SettingSaleService,
	getListVnPhone,
} from '@app/common'
import {
	AdminRequest,
	AdminRequestDocument,
	RequestStatus,
	SettingSaleApp,
	Shipper,
	ShipperDocument,
} from '@app/database'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { RequestWithdrawDTO } from '../dto/request-withdraw.dto'
import { RequestWithdrawItem } from '../dto/response.dto'
import moment from 'moment'

@Injectable()
export class ShipperAuthService {
	constructor(
		@InjectModel(Shipper.name)
		private readonly shipperModel: SoftDeleteModel<ShipperDocument>,
		private readonly fileService: FileService,
		private readonly saleSettingService: SettingSaleService,
		private readonly adminRequestService: AdminRequestService,
		@InjectModel(AdminRequest.name)
		private readonly adminRequestModel: Model<AdminRequestDocument>
	) {}

	async checkAccount(phone: string) {
		const shipperId = await this.getShipperId(phone)
		return !!shipperId
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
					wallet: true,
					createdAt: { $toLong: '$dob' },
				}
			)
			.orFail(new BadRequestException('Không tìm thấy tài xế'))
			.lean()
			.exec()
	}

	async createWithdrawRequest(shipperId: string, data: RequestWithdrawDTO) {
		const [saleSetting, shipper, existedRequest] = await Promise.all([
			this.saleSettingService.getData<Pick<SettingSaleApp, 'shipper'>>({
				shipper: true,
			}),
			this.shipperModel
				.findOne({ _id: new Types.ObjectId(shipperId) }, { wallet: true })
				.orFail(new BadRequestException('Không tìm thấy tài xế'))
				.lean()
				.exec(),
			this.adminRequestModel
				.findOne({
					targetId: new Types.ObjectId(shipperId),
					targetType: 'shipper',
					requestType: 'withdraw',
					status: RequestStatus.PENDING,
				})
				.lean()
				.exec(),
		])

		if (existedRequest) {
			throw new BadRequestException(
				`Bạn đã có một yêu cầu ${
					existedRequest.requestData?.withdrawAmount
						? `rút ${existedRequest.requestData.withdrawAmount.toLocaleString()}đ`
						: ''
				} đang chờ xử lý vào lúc ${moment(existedRequest.createdAt).format(
					'YYYY-MM-DD HH:mm'
				)}`
			)
		}

		const withdrawAmount = data.amount ?? shipper.wallet

		if (withdrawAmount > shipper.wallet) {
			throw new BadRequestException(`Bạn không có đủ số tiền cần rút`)
		}
		if (
			saleSetting.shipper?.minWithdraw &&
			withdrawAmount < saleSetting.shipper.minWithdraw
		) {
			throw new BadRequestException(
				`Ví tiền chưa đạt mức tối thiểu (${saleSetting.shipper.minWithdraw.toLocaleString()}đ)`
			)
		}

		await this.adminRequestService.create({
			targetId: shipperId,
			targetType: 'shipper',
			requestType: 'withdraw',
			requestData: {
				withdrawAmount,
			},
			priority: 'high',
		})
		return true
	}

	async getWithdrawHistory(shipperId: string) {
		return await this.adminRequestModel
			.aggregate<RequestWithdrawItem>([
				{
					$match: {
						targetId: new Types.ObjectId(shipperId),
						targetType: 'shipper',
						requestType: 'withdraw',
					},
				},
				{
					$project: {
						id: { $toString: '$_id' },
						_id: false,
						amount: { $ifNull: ['$requestData.withdrawAmount', 0] },
						status: true,
						createdAt: { $toLong: '$createdAt' },
					},
				},
				{
					$match: {
						amount: { $gt: 0 },
					},
				},
				{
					$sort: {
						createdAt: -1,
					},
				},
			])
			.exec()
	}
}
