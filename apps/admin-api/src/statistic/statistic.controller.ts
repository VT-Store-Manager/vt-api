import { ApiSuccessResponse } from '@app/common'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
	SaleStatisticItemDTO,
	StatisticAmountDTO,
	StatisticOrderInPeriodDTO,
	StatisticRankAmountDTO,
} from './dto/response.dto'
import { StatisticAmountDurationDTO } from './dto/statistic-amount-duration.dto'
import { StatisticService } from './statistic.service'
import { StatisticSaleQueryDTO } from './dto/statistic-sale-query.dto'
import { JwtAccess } from '../auth/decorators/jwt.decorator'

@Controller({
	path: 'admin/statistic',
	version: '1',
})
@ApiTags('admin-app > statistic')
@JwtAccess()
export class StatisticController {
	constructor(private readonly statisticService: StatisticService) {}

	@Get('total-amount')
	@ApiSuccessResponse(StatisticAmountDTO)
	async getStatisticAmount(@Query() query: StatisticAmountDurationDTO) {
		const [member, order, revenue, sale] = await Promise.all([
			this.statisticService.getMemberAmount(query),
			this.statisticService.getOrderAmount(query),
			this.statisticService.getRevenue(query),
			this.statisticService.getSaleAmount(query),
		])

		return { member, order, revenue, sale }
	}

	@Get('order-data')
	@ApiSuccessResponse(StatisticOrderInPeriodDTO)
	async getStatisticOrderData() {
		return await this.statisticService.getOrderData()
	}

	@Get('sale-ranking')
	@ApiSuccessResponse(SaleStatisticItemDTO, 200, true)
	async getSaleRanking(@Query() query: StatisticSaleQueryDTO) {
		return await this.statisticService.getSaleRanking(query)
	}

	@Get('category-sale')
	@ApiSuccessResponse(SaleStatisticItemDTO, 200, true)
	async getCategorySale(@Query() query: StatisticSaleQueryDTO) {
		return await this.statisticService.getSaleProductCategory(query)
	}

	@Get('rank-data')
	@ApiSuccessResponse(StatisticRankAmountDTO, 200, true)
	async getStatisticRankData() {
		return await this.statisticService.getMemberRankData()
	}
}
