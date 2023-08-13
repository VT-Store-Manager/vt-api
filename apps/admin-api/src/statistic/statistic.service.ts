import { Model } from 'mongoose'

import {
	DAY_DURATION,
	OrderBuyer,
	OrderState,
	RangeTimeType,
	ShippingMethod,
} from '@app/common'
import { Member, MemberDocument, Order, OrderDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { StatisticAmountDurationDTO } from './dto/statistic-amount-duration.dto'
import { StatisticSaleVolumeDTO } from './dto/statistic-sale-volume.dto'
import {
	ProductSaleStatisticItemDTO,
	StatisticOrderDataItem,
} from './dto/response.dto'

type OrderPrice = Pick<Order, '_id' | 'createdAt' | 'totalProductPrice'>
type OrderSoldAmount = Pick<Order, '_id' | 'createdAt'> & {
	soldAmount: number
}

@Injectable()
export class StatisticService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>,
		@InjectModel(Order.name)
		private readonly orderModel: Model<OrderDocument>
	) {}

	private getToday() {
		const date = new Date()
		return new Date(date.getFullYear(), date.getMonth(), date.getDate())
	}

	private sortObjectByKey(obj: Record<string, any>) {
		return Object.keys(obj)
			.sort()
			.reduce((res, key) => {
				res[key] = obj[key]
				return res
			}, {})
	}

	async getMemberAmount(query: StatisticAmountDurationDTO) {
		const todayUnix = this.getToday().getTime()

		const members = await this.memberModel
			.aggregate<{
				deleted: boolean
				deletedAt?: Date
				createdAt: Date
			}>([
				{
					$match: {
						notVerified: null,
						deleted: false,
					},
				},
				{
					$project: {
						_id: false,
						createdAt: true,
					},
				},
			])
			.exec()

		const thisTimeMembers = members.filter(member => {
			return (
				member.createdAt.getTime() >= todayUnix - query.duration * DAY_DURATION
			)
		})
		const previousTimeMembers = members.filter(member => {
			return (
				member.createdAt.getTime() <
					todayUnix - query.duration * DAY_DURATION &&
				member.createdAt.getTime() >=
					todayUnix - query.duration * 2 * DAY_DURATION
			)
		})

		return {
			totalCount: members.length,
			thisTime: thisTimeMembers.length,
			previousTime: previousTimeMembers.length,
		}
	}

	async getOrderAmount(query: StatisticAmountDurationDTO) {
		const todayUnix = this.getToday().getTime()

		const orders = await this.orderModel
			.aggregate<Pick<Order, '_id' | 'createdAt'>>([
				{
					$match: {
						state: OrderState.DONE,
					},
				},
				{
					$project: {
						createdAt: true,
					},
				},
				{
					$sort: {
						createdAt: 1,
					},
				},
			])
			.exec()
		const thisTimeOrders = orders.filter(order => {
			return (
				order.createdAt.getTime() >= todayUnix - query.duration * DAY_DURATION
			)
		})
		const previousTimeOrders = orders.filter(order => {
			return (
				order.createdAt.getTime() < todayUnix - query.duration * DAY_DURATION &&
				order.createdAt.getTime() >=
					todayUnix - query.duration * 2 * DAY_DURATION
			)
		})

		return {
			totalCount: orders.length,
			thisTime: thisTimeOrders.length,
			previousTime: previousTimeOrders.length,
		}
	}

	async getRevenue(query: StatisticAmountDurationDTO) {
		const todayUnix = this.getToday().getTime()

		const orders = await this.orderModel
			.aggregate<OrderPrice>([
				{
					$match: {
						state: OrderState.DONE,
					},
				},
				{
					$project: {
						createdAt: true,
						totalProductPrice: true,
					},
				},
				{
					$sort: {
						createdAt: 1,
					},
				},
			])
			.exec()
		const thisTimeOrders = orders.filter(order => {
			return (
				order.createdAt.getTime() >= todayUnix - query.duration * DAY_DURATION
			)
		})
		const previousTimeOrders = orders.filter(order => {
			return (
				order.createdAt.getTime() < todayUnix - query.duration * DAY_DURATION &&
				order.createdAt.getTime() >=
					todayUnix - query.duration * 2 * DAY_DURATION
			)
		})

		const getRevenue = (arr: OrderPrice[]) => {
			return arr.reduce((sum, order) => {
				return sum + (order.totalProductPrice || 0)
			}, 0)
		}

		return {
			totalCount: getRevenue(orders),
			thisTime: getRevenue(thisTimeOrders),
			previousTime: getRevenue(previousTimeOrders),
		}
	}

	async getSaleAmount(query: StatisticAmountDurationDTO) {
		const todayUnix = this.getToday().getTime()

		const orders = await this.orderModel
			.aggregate<OrderSoldAmount>([
				{
					$match: {
						state: OrderState.DONE,
					},
				},
				{
					$project: {
						soldAmount: {
							$reduce: {
								input: '$items',
								initialValue: 0,
								in: {
									$add: ['$$value', '$$this.quantity'],
								},
							},
						},
						createdAt: true,
					},
				},
			])
			.exec()

		const thisTimeOrders = orders.filter(order => {
			return (
				order.createdAt.getTime() >= todayUnix - query.duration * DAY_DURATION
			)
		})
		const previousTimeOrders = orders.filter(order => {
			return (
				order.createdAt.getTime() < todayUnix - query.duration * DAY_DURATION &&
				order.createdAt.getTime() >=
					todayUnix - query.duration * 2 * DAY_DURATION
			)
		})

		const getSoldAmount = (arr: OrderSoldAmount[]) => {
			return arr.reduce((sum, order) => {
				return sum + (order.soldAmount || 0)
			}, 0)
		}

		return {
			totalCount: getSoldAmount(orders),
			thisTime: getSoldAmount(thisTimeOrders),
			previousTime: getSoldAmount(previousTimeOrders),
		}
	}

	async getOrderData() {
		const orderAmountHistoryByDay = await this.orderModel
			.aggregate<StatisticOrderDataItem>([
				{
					$match: {
						state: OrderState.DONE,
					},
				},
				{
					$addFields: {
						day: {
							$dateToString: {
								date: '$createdAt',
								format: '%Y-%m-%d',
								timezone: 'Asia/Ho_Chi_Minh',
							},
						},
					},
				},
				{
					$group: {
						_id: '$day',
						inStoreCount: {
							$sum: {
								$cond: [{ $eq: ['$type', ShippingMethod.IN_STORE] }, 1, 0],
							},
						},
						pickupCount: {
							$sum: {
								$cond: [{ $eq: ['$type', ShippingMethod.PICK_UP] }, 1, 0],
							},
						},
						deliveryCount: {
							$sum: {
								$cond: [{ $eq: ['$type', ShippingMethod.DELIVERY] }, 1, 0],
							},
						},
						memberOrderCount: {
							$sum: {
								$cond: [{ $eq: ['$buyer', OrderBuyer.MEMBER] }, 1, 0],
							},
						},
						totalProfit: {
							$sum: '$totalProductPrice',
						},
						totalDeliveryOrderProfit: {
							$sum: {
								$cond: [
									{ $eq: ['$type', ShippingMethod.DELIVERY] },
									'$totalProductPrice',
									0,
								],
							},
						},
					},
				},
				{
					$addFields: {
						id: '$_id',
						totalCount: {
							$sum: ['$inStoreCount', '$pickupCount', '$deliveryCount'],
						},
					},
				},
				{
					$project: {
						_id: false,
					},
				},
				{
					$sort: {
						day: 1,
					},
				},
			])
			.exec()

		const orderHistoryByDay = {}
		const orderHistoryByMonth = {}
		const orderHistoryByYear = {}

		orderAmountHistoryByDay.forEach(order => {
			// Add to order day
			orderHistoryByDay[order.id] = order

			// Add to order month
			const month = order.id.slice(0, 7)
			const orderByMonth: StatisticOrderDataItem = orderHistoryByMonth[
				month
			] || {
				id: month,
				inStoreCount: 0,
				pickupCount: 0,
				deliveryCount: 0,
				totalCount: 0,
				memberOrderCount: 0,
				totalDeliveryOrderProfit: 0,
				totalProfit: 0,
			}

			orderByMonth.inStoreCount += order.inStoreCount
			orderByMonth.pickupCount += order.pickupCount
			orderByMonth.deliveryCount += order.deliveryCount
			orderByMonth.totalCount += order.totalCount
			orderByMonth.memberOrderCount += order.memberOrderCount
			orderByMonth.totalDeliveryOrderProfit += order.totalDeliveryOrderProfit
			orderByMonth.totalProfit += order.totalProfit

			orderHistoryByMonth[month] = orderByMonth

			// Add to order year
			const year = order.id.slice(0, 4)
			const orderByYear: StatisticOrderDataItem = orderHistoryByYear[year] || {
				id: year,
				inStoreCount: 0,
				pickupCount: 0,
				deliveryCount: 0,
				totalCount: 0,
				memberOrderCount: 0,
				totalDeliveryOrderProfit: 0,
				totalProfit: 0,
			}

			orderByYear.inStoreCount += order.inStoreCount
			orderByYear.pickupCount += order.pickupCount
			orderByYear.deliveryCount += order.deliveryCount
			orderByYear.totalCount += order.totalCount
			orderByYear.memberOrderCount += order.memberOrderCount
			orderByYear.totalDeliveryOrderProfit += order.totalDeliveryOrderProfit
			orderByYear.totalProfit += order.totalProfit

			orderHistoryByYear[year] = orderByYear
		})

		return {
			year: this.sortObjectByKey(orderHistoryByYear),
			month: this.sortObjectByKey(orderHistoryByMonth),
			day: this.sortObjectByKey(orderHistoryByDay),
		}
	}

	async getSaleRanking({
		timePeriod,
	}: StatisticSaleVolumeDTO): Promise<ProductSaleStatisticItemDTO[]> {
		let startTime = this.getToday()
		if (!timePeriod) {
			startTime = new Date(0, 0, 0)
		} else if (timePeriod === RangeTimeType.YEAR) {
			startTime.setFullYear(startTime.getFullYear() - 1)
		} else if (timePeriod === RangeTimeType.QUARTER) {
			startTime.setMonth(startTime.getMonth() - 3)
		} else if (timePeriod === RangeTimeType.MONTH) {
			startTime.setMonth(startTime.getMonth() - 1)
		} else if (timePeriod === RangeTimeType.WEEK) {
			startTime.setDate(startTime.getDate() - 7)
		}

		const productStatisticData = await this.orderModel
			.aggregate<ProductSaleStatisticItemDTO>([
				{
					$match: {
						createdAt: {
							$gte: startTime,
						},
						state: OrderState.DONE,
					},
				},
				{
					$unwind: {
						path: '$items',
					},
				},
				{
					$group: {
						_id: '$items.productId',
						saleVolume: {
							$sum: '$items.quantity',
						},
						profit: {
							$sum: {
								$multiply: [
									'$items.quantity',
									{
										$subtract: ['$items.unitPrice', '$items.unitSalePrice'],
									},
								],
							},
						},
					},
				},
				{
					$lookup: {
						from: 'products',
						localField: '_id',
						foreignField: '_id',
						as: 'product',
						pipeline: [
							{
								$match: {
									deleted: false,
								},
							},
							{
								$project: {
									name: true,
									image: { $first: '$images' },
								},
							},
						],
					},
				},
				{
					$unwind: {
						path: '$product',
					},
				},
				{
					$project: {
						id: '$_id',
						_id: false,
						saleVolume: true,
						profit: true,
						name: '$product.name',
						image: '$product.image',
					},
				},
				{
					$sort: {
						saleVolume: -1,
					},
				},
			])
			.exec()

		return productStatisticData
	}
}
