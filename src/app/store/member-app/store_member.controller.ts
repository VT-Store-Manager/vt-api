import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { StoreMemberService } from './store_member.service'

@Controller({
	path: 'member/store',
	version: '1',
})
@ApiTags('member-app > store')
export class StoreMemberController {
	constructor(private readonly storeMemberService: StoreMemberService) {}

	@Get()
	async getAllStoreInShort() {
		return await this.storeMemberService.getAllStoresInShort()
	}
}
