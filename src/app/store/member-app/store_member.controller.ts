import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ShortStoreItemDTO, StoreDetailDTO } from './dto/response.dto'

import { StoreMemberService } from './store_member.service'

@Controller({
	path: 'member/store',
	version: '1',
})
@ApiTags('member-app > store')
export class StoreMemberController {
	constructor(private readonly storeMemberService: StoreMemberService) {}

	@Get()
	@ApiSuccessResponse(ShortStoreItemDTO, 200, true)
	async getAllStoreInShort() {
		return await this.storeMemberService.getAllStoresInShort()
	}

	@Get(':id')
	@ApiSuccessResponse(StoreDetailDTO)
	async getStoreDetail(@Param('id', ObjectIdPipe) storeId: string) {
		return await this.storeMemberService.getStoreDetail(storeId)
	}
}
