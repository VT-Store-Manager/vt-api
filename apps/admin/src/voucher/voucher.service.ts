import { intersection } from 'lodash'
import { ClientSession, Model, Types } from 'mongoose'

import {
	AppName,
	FileService,
	PublishStatus,
	Status,
	s3KeyPattern,
} from '@app/common'
import {
	ConditionInclusion,
	OfferTarget,
	Product,
	ProductDocument,
	ProductOption,
	ProductOptionDocument,
	Voucher,
	VoucherDocument,
} from '@app/database'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateVoucherDTO } from './dto/create-voucher.dto'
import { GetVoucherPaginationDTO } from './dto/get-voucher-pagination.dto'
import {
	GetVoucherListDTO,
	VoucherDetailDTO,
	VoucherListItemDTO,
} from './dto/response.dto'
import { UpdateVoucherConditionDTO } from './dto/update-voucher-condition.dto'
import { UpdateVoucherDiscountDTO } from './dto/update-voucher-discount.dto'
import { UpdateVoucherInfoDTO } from './dto/update-voucher-info.dto'

@Injectable()
export class VoucherService {
	constructor(
		@InjectModel(Voucher.name)
		private readonly voucherModel: Model<VoucherDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(ProductOption.name)
		private readonly productOptionModel: Model<ProductOptionDocument>,
		private readonly fileService: FileService
	) {}

	async create(data: CreateVoucherDTO, session?: ClientSession) {
		const [voucher] = await this.voucherModel.create(
			[{ ...data }],
			session ? { session } : {}
		)
		return voucher
	}

	async getDetail(voucherId: string, select = '') {
		return await this.voucherModel
			.findById(new Types.ObjectId(voucherId))
			.orFail(new BadRequestException('Voucher not found'))
			.select(select)
			.lean()
			.exec()
	}

	async updateDiscount(
		voucherId: string,
		data: UpdateVoucherDiscountDTO,
		session?: ClientSession
	) {
		if (data.offerTarget && data.offerTarget.length > 0) {
			await this.validateOfferTargets(data.offerTarget)
		}

		const updateResult = await this.voucherModel.updateOne(
			{ _id: new Types.ObjectId(voucherId) },
			{
				discount: data,
			},
			session ? { session } : {}
		)

		return updateResult.modifiedCount === 1
	}

	async updateCondition(
		voucherId: string,
		data: UpdateVoucherConditionDTO,
		session?: ClientSession
	) {
		if (data.inclusion && data.inclusion.length > 0) {
			await this.validateOfferTargets(data.inclusion)
		}

		const updateResult = await this.voucherModel.updateOne(
			{ _id: new Types.ObjectId(voucherId) },
			{
				condition: data,
			},
			session ? { session } : {}
		)

		return updateResult.modifiedCount === 1
	}

	// PRIVATE METHODS

	private async validateOfferTargets(
		offerTargets: (OfferTarget | ConditionInclusion)[]
	) {
		const result = await Promise.all(
			offerTargets.map(target => this.validateOfferTarget(target))
		)
		return result
	}

	private async validateOfferTarget(
		offerTarget: OfferTarget | ConditionInclusion
	) {
		// 1. Get products with id + get product options with list of item keys
		const ids = offerTarget.ids?.map(id => new Types.ObjectId(id))
		// eslint-disable-next-line prefer-const
		let [products, ...optionList] = await Promise.all([
			this.productModel
				.find(
					ids && ids.length > 0
						? {
								$or: [{ category: { $in: ids } }, { _id: { $in: ids } }],
						  }
						: {}
				)
				.orFail(new BadRequestException('Offer target not found'))
				.select('options')
				.lean()
				.exec(),
			...offerTarget.options.map(option => {
				const itemKeys = option.replaceAll(/&|\|/g, ' ').split(' ')
				return this.productOptionModel
					.find({
						$and: itemKeys.map(key => ({
							$or: [{ 'items.key': key }, { 'items.parentKey': key }],
						})),
					})
					.select('range items')
					.lean()
					.exec()
			}),
		])

		// 2. Loop list of target options
		optionList.some((options, index) => {
			// Throw exception if target is empty
			if (options.length === 0)
				throw new BadRequestException(
					'Offer target is not match with any options'
				)
			const numberOfOption = options.reduce(
				(result, option) =>
					result > option.range[1] ? result : option.range[1],
				0
			)
			// Throw exception if number of all selected keys is greater than max range
			if (
				offerTarget.options[index].split('|').every(keys => {
					return keys.split('&').filter(s => !!s).length > numberOfOption
				})
			) {
				throw new BadRequestException(
					'Offer target is greater than max selected of options'
				)
			}
			// Filter products contain all option in condition of target
			products = products.filter(product => {
				return intersection<string>(
					product.options.map(o => o.toString()),
					options.map(o => o._id.toString())
				).length
			})

			return products.length === 0
		})

		// Throw exception if products if no contain any product is matched
		if (products.length === 0)
			throw new BadRequestException(
				'Offer target is not match with any product'
			)
		return products
	}

	async softDelete(voucherId: string, adminId: string) {
		const updateResult = await this.voucherModel
			.updateOne(
				{
					_id: new Types.ObjectId(voucherId),
					deleted: false,
				},
				{
					deleted: true,
					deletedAt: new Date(),
					deletedBy: new Types.ObjectId(adminId),
				}
			)
			.orFail(new BadRequestException('Voucher not found or deleted'))
			.exec()
		return updateResult.modifiedCount === 1
	}

	async restore(voucherId: string) {
		const updateResult = await this.voucherModel
			.updateOne(
				{
					_id: new Types.ObjectId(voucherId),
					deleted: true,
				},
				{
					deleted: false,
					$unset: {
						deletedAt: true,
						deletedBy: true,
					},
				}
			)
			.orFail(new BadRequestException('Voucher not found or deleted'))
			.exec()
		return updateResult.modifiedCount === 1
	}

	async getVoucherWithPagination(
		query: GetVoucherPaginationDTO
	): Promise<GetVoucherListDTO> {
		const now = new Date()
		const [vouchers, count] = await Promise.all([
			this.voucherModel
				.aggregate<VoucherListItemDTO>([
					{
						$sort: {
							createdAt: -1,
						},
					},
					{
						$lookup: {
							from: 'partners',
							localField: 'partner',
							foreignField: '_id',
							as: 'partner',
						},
					},
					{
						$unwind: {
							path: '$partner',
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$addFields: {
							activeFinishTime: {
								$ifNull: ['$activeFinishTime', null],
							},
						},
					},
					{
						$project: {
							id: '$_id',
							_id: false,
							name: '$title',
							image: true,
							code: true,
							partner: {
								$cond: [
									{ $eq: [{ $ifNull: ['$partner', null] }, null] },
									null,
									{
										id: '$partner._id',
										name: '$partner.name',
										code: '$partner.code',
										image: '$partner.image',
										deleted: '$partner.deleted',
										deletedAt: '$partner.deletedAt',
									},
								],
							},
							startTime: { $toLong: '$activeStartTime' },
							finishTime: { $toLong: '$activeFinishTime' },
							publishStatus: {
								$cond: [
									{ $lt: [now, '$activeStartTime'] },
									PublishStatus.NOT_YET,
									{
										$cond: [
											{
												$or: [
													{ $eq: ['$activeFinishTime', null] },
													{ $lt: [now, '$activeFinishTime'] },
												],
											},
											PublishStatus.OPENING,
											PublishStatus.CLOSED,
										],
									},
								],
							},
							updatedAt: { $toLong: '$updatedAt' },
							status: {
								$cond: {
									if: { $eq: ['$deleted', true] },
									then: Status.REMOVED,
									else: {
										$cond: {
											if: { $eq: ['$disabled', true] },
											then: Status.DISABLED,
											else: Status.ACTIVE,
										},
									},
								},
							},
						},
					},
					{ $skip: (query.page - 1) * query.limit },
					{ $limit: query.limit },
				])
				.exec(),
			this.voucherModel.countDocuments().exec(),
		])

		return {
			totalCount: count,
			items: vouchers,
		}
	}

	async getVoucherDetail(voucherId: string) {
		const [voucher] = await this.voucherModel
			.aggregate<VoucherDetailDTO>([
				{
					$match: {
						_id: new Types.ObjectId(voucherId),
						deleted: { $ne: true },
					},
				},
				{
					$project: {
						id: { $toString: '$_id' },
						_id: false,
						title: true,
						image: this.fileService.getImageUrlExpression(
							'$image',
							undefined,
							AppName.ADMIN
						),
						code: true,
						partner: {
							$cond: [
								{ $eq: [{ $ifNull: ['$partner', null] }, null] },
								null,
								'$partner',
							],
						},
						description: true,
						expireHour: true,
						activeStartTime: true,
						activeFinishTime: true,
						discount: true,
						condition: true,
						slider: this.fileService.getImageUrlExpression(
							'$slider',
							undefined,
							AppName.ADMIN
						),
						disabled: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			])
			.exec()

		if (!voucher) throw new BadRequestException('Voucher not found')

		return voucher
	}

	async updateInfo(
		voucherId: string,
		data: UpdateVoucherInfoDTO | Partial<Voucher>,
		session?: ClientSession
	) {
		const updateResult = await this.voucherModel
			.findOneAndUpdate(
				{ _id: new Types.ObjectId(voucherId) },
				{ $set: { ...data } },
				{ session }
			)
			.orFail(new BadRequestException('Voucher not found'))
			.lean()
			.exec()

		if (
			data.image &&
			s3KeyPattern.test(updateResult?.image) &&
			data.image !== updateResult?.image
		) {
			this.fileService
				.delete([updateResult.image])
				.then(() => {
					Logger.debug(`Delete image ${updateResult.image} successful`)
				})
				.catch(error => {
					Logger.debug(`Delete image ${updateResult.image} failed`, error)
				})
		}

		return true
	}
}
