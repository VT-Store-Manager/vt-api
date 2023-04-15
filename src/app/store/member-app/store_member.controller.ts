import { CurrentUser } from '@/app/auth/decorators/current-user.decorator'
import { JwtAccessOptional } from '@/app/auth/decorators/jwt.decorator'
import { Role } from '@/common/constants'
import { ApiSuccessResponse } from '@/common/decorators/api-sucess-response.decorator'
import { ObjectIdPipe } from '@/common/pipes/object-id.pipe'
import { TokenPayload } from '@/types/token.dto'
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

	@Get('short')
	@JwtAccessOptional(Role.MEMBER)
	@ApiSuccessResponse(ShortStoreItemDTO, 200, true)
	async getAllStoreInShort(@CurrentUser() user: TokenPayload) {
		return await this.storeMemberService.getAllStoresInShort(
			user ? user.sub : undefined
		)
	}

	@Get(':id')
	@ApiSuccessResponse(StoreDetailDTO)
	async getStoreDetail(@Param('id', ObjectIdPipe) storeId: string) {
		return await this.storeMemberService.getStoreDetail(storeId)
	}
}
