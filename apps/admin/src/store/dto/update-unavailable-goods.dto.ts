import { IsMongoId } from 'class-validator'

export class UpdateUnavailableGoodsDTO {
	@IsMongoId()
	storeId: string

	@IsMongoId({ each: true })
	product: string[]

	@IsMongoId({ each: true })
	category: string[]

	@IsMongoId({ each: true })
	option: string[]
}
