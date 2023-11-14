import { IsMongoId, IsString, Matches } from 'class-validator'

export class CreateAccountSaleDTO {
	@IsString()
	@Matches(/^[a-zA-Z0-9_.-]{3,}$/)
	username: string

	@IsMongoId()
	storeId: string
}
