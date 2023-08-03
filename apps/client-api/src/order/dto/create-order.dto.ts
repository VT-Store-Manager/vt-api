import { Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsArray,
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsPhoneNumber,
	IsString,
	Min,
	ValidateNested,
} from 'class-validator'

import { PaymentType, ShippingMethod } from '@app/common'

import { ShortProductInCartDTO } from './check-voucher.dto'

export class CreateOrderDTO {
	@IsOptional()
	@IsMongoId()
	storeId?: string

	@IsEnum(ShippingMethod)
	categoryId: ShippingMethod

	@IsOptional()
	@IsEnum(PaymentType)
	payType?: PaymentType = PaymentType.CAST

	@IsOptional()
	@IsPhoneNumber()
	phone?: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	receiver?: string

	@IsOptional()
	@IsMongoId()
	voucherId?: string

	@IsOptional()
	@IsNumber()
	@Min(Date.now() - 60000)
	receivingTime?: number = Date.now()

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	addressName?: string

	@IsArray()
	@ArrayMinSize(1)
	@Type(() => ShortProductInCartDTO)
	@ValidateNested({ each: true })
	products: ShortProductInCartDTO[]
}