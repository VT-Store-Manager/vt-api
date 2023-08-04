import { Model } from 'mongoose'

import { DAY_DURATION, OrderState } from '@app/common'
import { Member, MemberDocument, Order, OrderDocument } from '@app/database'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'

import { StatisticAmountDurationDTO } from './dto/statistic-amount-duration.dto'

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
}
