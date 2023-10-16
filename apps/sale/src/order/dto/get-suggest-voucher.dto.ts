import { Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsMongoId,
	IsNumber,
	IsString,
	Matches,
	Min,
	ValidateNested,
} from 'class-validator'

export class GetSuggestVoucherDTO {
	@IsMongoId()
	userId: string

	@ValidateNested({ each: true })
	@Type(() => SuggestVoucherProductItem)
	@ArrayMinSize(1)
	products: SuggestVoucherProductItem[]
}

export class SuggestVoucherProductItem {
	@IsMongoId()
	id: string

	@IsString({ each: true })
	@Matches(/[a-z]{6}/, { each: true })
	options: string[]

	@IsNumber()
	@Min(1)
	amount: number
}
