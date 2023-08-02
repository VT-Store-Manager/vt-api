import { Controller, Get, Query } from '@nestjs/common'

import { GetUserAmountDTO } from './dto/get-user-amount.dto'
import { StatisticService } from './statistic.service'
import { ApiTags } from '@nestjs/swagger'

@Controller({
	path: 'admin/statistic',
	version: '1',
})
@ApiTags('admin-app > statistic')
export class StatisticController {
	constructor(private readonly statisticService: StatisticService) {}

	@Get('member-amount')
	async getMemberAmount(@Query() query: GetUserAmountDTO) {
		return await this.statisticService.getMemberAmount(query)
	}
}
