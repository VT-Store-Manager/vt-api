import { ApiSuccessResponse } from '@app/common'
import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { SlideItemDTO } from './dto/response.dto'
import { SlideService } from './slide.service'

@Controller('member/slide')
@ApiTags('member-app > slide')
export class SlideController {
	constructor(private readonly slideService: SlideService) {}

	@Get()
	@ApiSuccessResponse(SlideItemDTO, 200, true)
	async getAllSlides() {
		return await this.slideService.getAllSlides()
	}
}
