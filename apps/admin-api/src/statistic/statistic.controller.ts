import { Controller, Get, Query } from '@nestjs/common'

import { StatisticService } from './statistic.service'
import { ApiTags } from '@nestjs/swagger'
import { StatisticAmountDurationDTO } from './dto/statistic-amount-duration.dto'

@Controller({
	path: 'admin/statistic',
	version: '1',
})
@ApiTags('admin-app > statistic')
export class StatisticController {
	constructor(private readonly statisticService: StatisticService) {}

	@Get('total-amount')
	async getStatisticAmount(@Query() query: StatisticAmountDurationDTO) {
		const [member, order, revenue, sale] = await Promise.all([
			this.statisticService.getMemberAmount(query),
			this.statisticService.getOrderAmount(query),
			this.statisticService.getRevenue(query),
			this.statisticService.getSaleAmount(query),
		])

		return { member, order, revenue, sale }
	}
}
