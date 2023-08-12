import { Model } from 'mongoose'

import {
	DAY_DURATION,
	OrderBuyer,
	OrderState,
	ShippingMethod,
} from '@app/common'
import { Member, MemberDocument, Order, OrderDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { StatisticAmountDurationDTO } from './dto/statistic-amount-duration.dto'

type OrderPrice = Pick<Order, '_id' | 'createdAt' | 'totalProductPrice'>
type OrderSoldAmount = Pick<Order, '_id' | 'createdAt'> & {
	soldAmount: number
}

type OrderTypeCount = {
	id: string
	inStoreCount: number
	pickupCount: number
	deliveryCount: number
	totalCount: number
	memberOrderCount: number
	totalProfit: number
	totalDeliveryOrderProfit: number
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
			.aggregate<OrderTypeCount>([
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
			const orderByMonth: OrderTypeCount = orderHistoryByMonth[month] || {
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
			const orderByYear: OrderTypeCount = orderHistoryByYear[year] || {
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
}
