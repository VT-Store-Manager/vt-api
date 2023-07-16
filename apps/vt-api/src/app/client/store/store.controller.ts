import { CurrentUser } from '@/app/authentication/decorators/current-user.decorator'
import {
	JwtAccess,
	JwtAccessOptional,
} from '@/app/authentication/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { BooleanResponseDTO } from '@/types/swagger'
import { Controller, Get, Param, Patch } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { ShortStoreItemDTO, StoreDetailDTO } from './dto/response.dto'
import { StoreService } from './store.service'

@Controller({
	path: 'member/store',
	version: '1',
})
@ApiTags('member-app > store')
export class StoreController {
	constructor(private readonly storeMemberService: StoreService) {}

	@Get('short')
	@JwtAccessOptional(Role.MEMBER)
	@ApiSuccessResponse(ShortStoreItemDTO, 200, true)
	async getAllStoreInShort(@CurrentUser('sub') memberId: string) {
		return await this.storeMemberService.getAllStoresInShort(
			memberId ?? undefined
		)
	}

	@Patch(':id/favorite')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO })
	async changeFavoriteProduct(
		@CurrentUser('sub') memberId: string,
		@Param('id') storeId: string
	) {
		return await this.storeMemberService.toggleFavoriteStore(memberId, storeId)
	}

	@Get(':id')
	@ApiSuccessResponse(StoreDetailDTO)
	async getStoreDetail(@Param('id', ObjectIdPipe) storeId: string) {
		return await this.storeMemberService.getStoreDetail(storeId)
	}
}
