import { intersection } from 'lodash'
import { ClientSession, Model, Types } from 'mongoose'

import {
	ProductOption,
	ProductOptionDocument,
} from '@/schemas/product-option.schema'
import { Product, ProductDocument } from '@/schemas/product.schema'
import { OfferTarget } from '@/schemas/voucher-discount.schema'
import { Voucher, VoucherDocument } from '@/schemas/voucher.schema'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { CreateVoucherDTO } from './dto/create-voucher.dto'
import { UpdateVoucherDiscountDTO } from './dto/update-voucher-discount.dto'
import { UpdateVoucherConditionDTO } from './dto/update-voucher-condition.dto'
import { ConditionInclusion } from '@/schemas/voucher-condition.schema'

@Injectable()
export class VoucherAdminService {
	constructor(
		@InjectModel(Voucher.name)
		private readonly voucherModel: Model<VoucherDocument>,
		@InjectModel(Product.name)
		private readonly productModel: Model<ProductDocument>,
		@InjectModel(ProductOption.name)
		private readonly productOptionModel: Model<ProductOptionDocument>
	) {}

	async create(data: CreateVoucherDTO, session?: ClientSession) {
		const [voucher] = await this.voucherModel.create(
			[{ ...data }],
			session ? { session } : {}
		)
		return voucher
	}

	async updateInfo(
		voucherId: string,
		data: Record<string, any>,
		session?: ClientSession
	) {
		Object.keys(data).forEach(key => {
			if (data[key] === undefined && data[key] === null) {
				delete data[key]
			}
		})
		if (data.activeStartTime) {
			data['activeStartTime'] = new Date(data.activeStartTime)
		}
		if (data.activeFinishTime) {
			data.activeFinishTime = new Date(data.activeFinishTime)
		}
		const updateResult = await this.voucherModel.updateOne(
			{ _id: new Types.ObjectId(voucherId) },
			data,
			session ? { session } : {}
		)
		return updateResult.modifiedCount === 1
	}

	async getDetail(voucherId: string, select = '') {
		return await this.voucherModel
			.findById(voucherId)
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
		// eslint-disable-next-line prefer-const
		let [products, ...optionList] = await Promise.all([
			this.productModel
				.find(
					offerTarget.id
						? {
								$or: [
									{ category: new Types.ObjectId(offerTarget.id) },
									{ _id: new Types.ObjectId(offerTarget.id) },
								],
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
}
