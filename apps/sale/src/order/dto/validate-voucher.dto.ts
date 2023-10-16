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

export class ValidateVoucherDTO {
	@IsMongoId()
	userId: string

	@IsMongoId()
	voucherId: string

	@ValidateNested({ each: true })
	@Type(() => ValidateVoucherProductItem)
	@ArrayMinSize(1)
	products: ValidateVoucherProductItem[]
}

export class ValidateVoucherProductItem {
	@IsMongoId()
	id: string

	@IsString({ each: true })
	@Matches(/[a-z]{6}/, { each: true })
	options: string[]

	@IsNumber()
	@Min(1)
	amount: number
}
