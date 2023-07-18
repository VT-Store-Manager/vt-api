import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Member, MemberDocument } from '@app/database'
import { Model } from 'mongoose'
@Injectable()
export class UserService {
	constructor(
		@InjectModel(Member.name)
		private readonly memberModel: Model<MemberDocument>
	) {}
}
