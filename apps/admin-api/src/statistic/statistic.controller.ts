import { ApiSuccessResponse } from '@app/common'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import {
	ProductSaleStatisticItemDTO,
	StatisticAmountDTO,
	StatisticOrderInPeriodDTO,
} from './dto/response.dto'
import { StatisticAmountDurationDTO } from './dto/statistic-amount-duration.dto'
import { StatisticService } from './statistic.service'
import { StatisticSaleVolumeDTO } from './dto/statistic-sale-volume.dto'

@Controller({
	path: 'admin/statistic',
	version: '1',
})
@ApiTags('admin-app > statistic')
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
	@ApiSuccessResponse(ProductSaleStatisticItemDTO, 200, true)
	async getSaleVolumeRanking(@Query() query: StatisticSaleVolumeDTO) {
		return await this.statisticService.getSaleRanking(query)
	}
}
