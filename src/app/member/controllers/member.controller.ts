import { Member, MemberDocument } from '@/schemas/member.schema'
import { Controller } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Controller('member')
export class MemberController {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>
	) {}
}
