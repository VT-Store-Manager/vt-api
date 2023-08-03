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

	@Get('member-amount')
	async getMemberAmount(@Query() query: StatisticAmountDurationDTO) {
		return await this.statisticService.getMemberAmount(query)
	}

	@Get('order-amount')
	async getOrderAmount(@Query() query: StatisticAmountDurationDTO) {
		return await this.statisticService.getOrderAmount(query)
	}
}
