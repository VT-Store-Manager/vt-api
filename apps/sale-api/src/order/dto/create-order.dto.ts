import { Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsArray,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
	Matches,
	ValidateNested,
} from 'class-validator'

import { PaymentType } from '@app/common'

export class CreateOrderDTO {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	memberCode?: string

	@IsOptional()
	@IsMongoId()
	voucherId?: string

	@IsOptional()
	@IsEnum(PaymentType)
	payType?: PaymentType = PaymentType.CAST

	@IsArray()
	@ArrayMinSize(1)
	@Type(() => CreateOrderItemDTO)
	@ValidateNested({ each: true })
	products: CreateOrderItemDTO[]
}

export class CreateOrderItemDTO {
	@IsMongoId()
	id: string

	@IsString({ each: true })
	@Matches(/[a-z]{6}/, { each: true })
	options: string[] = []

	@IsPositive()
	amount: number

	@IsOptional()
	@IsString()
	note?: string = ''
}
