import { ApiSuccessResponse } from '@app/common'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { SlideItemDTO } from './dto/response.dto'
import { SlideService } from './slide.service'
import { GetSlideQueryDTO } from './dto/get-slide-query.dto'

@Controller('member/slide')
@ApiTags('member-app > slide')
export class SlideController {
	constructor(private readonly slideService: SlideService) {}

	@Get()
	@ApiSuccessResponse(SlideItemDTO, 200, true)
	async getAllSlides(@Query() query: GetSlideQueryDTO) {
		return await this.slideService.getAllSlides(query)
	}
}
