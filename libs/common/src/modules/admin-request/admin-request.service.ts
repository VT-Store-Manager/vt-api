import { AdminRequest, AdminRequestDocument } from '@/libs/database/src'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ClientSession, Model } from 'mongoose'

@Injectable()
export class AdminRequestService {
	constructor(
		@InjectModel(AdminRequest.name)
		private readonly adminRequestModel: Model<AdminRequestDocument>
	) {}

	async create(
		data: Pick<
			AdminRequest,
			| 'targetId'
			| 'targetType'
			| 'requestType'
			| 'requestData'
			| 'title'
			| 'description'
			| 'priority'
		>,
		session?: ClientSession
	) {
		const createdRequests = await this.adminRequestModel.create([{ ...data }], {
			session,
		})

		return createdRequests[0]
	}
}
