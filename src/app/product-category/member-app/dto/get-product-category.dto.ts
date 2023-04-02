import { IsMongoId, IsOptional } from 'class-validator'

export class GetProductCategoryDTO {
	@IsMongoId()
	@IsOptional()
	storeId?: string
}
