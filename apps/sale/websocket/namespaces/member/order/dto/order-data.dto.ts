import { IsMongoId } from 'class-validator'

export class OrderDataDTO {
	@IsMongoId()
	orderId: string
}
