import { IsMongoId } from 'class-validator'

export class MemberNewOrderDTO {
	@IsMongoId()
	orderId: string

	@IsMongoId()
	storeId: string
}
