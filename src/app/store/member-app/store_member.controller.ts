import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import {
	JwtAccess,
	JwtAccessOptional,
} from '@/app/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-success-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { BooleanResponseDTO } from '@/types/http.swagger'
import { UserPayload } from '@/types/token.dto'
import { Controller, Get, Param, Patch } from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { ShortStoreItemDTO, StoreDetailDTO } from './dto/response.dto'
import { StoreMemberService } from './store_member.service'

@Controller({
	path: 'member/store',
	version: '1',
})
@ApiTags('member-app > store')
export class StoreMemberController {
	constructor(private readonly storeMemberService: StoreMemberService) {}

	@Get('short')
	@JwtAccessOptional(Role.MEMBER)
	@ApiSuccessResponse(ShortStoreItemDTO, 200, true)
	async getAllStoreInShort(@CurrentUser() user: UserPayload) {
		return await this.storeMemberService.getAllStoresInShort(
			user ? user.sub : undefined
		)
	}

	@Patch(':id/favorite')
	@JwtAccess(Role.MEMBER)
	@ApiResponse({ type: BooleanResponseDTO })
	async changeFavoriteProduct(
		@CurrentUser() user: UserPayload,
		@Param('id') storeId: string
	) {
		return await this.storeMemberService.toggleFavoriteStore(user.sub, storeId)
	}

	@Get(':id')
	@ApiSuccessResponse(StoreDetailDTO)
	async getStoreDetail(@Param('id', ObjectIdPipe) storeId: string) {
		return await this.storeMemberService.getStoreDetail(storeId)
	}
}
