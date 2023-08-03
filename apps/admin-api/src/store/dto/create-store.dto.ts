import { Type } from 'class-transformer'
import {
	IsArray,
	IsMilitaryTime,
	IsNotEmpty,
	IsOptional,
	IsString,
	Validate,
	ValidateNested,
} from 'class-validator'

import { ApiPropertyMultiFiles, ObjectIdRule } from '@app/common'
import { Address, OpenTime, Store, UnavailableGoods } from '@app/database'
import { PickType } from '@nestjs/swagger'

class OpenTimeValidator extends OpenTime {
	@IsMilitaryTime()
	start: string

	@IsMilitaryTime()
	end: string
}

class AddressValidator extends Address {
	@IsString()
	@IsNotEmpty()
	street: string

	@IsString()
	@IsOptional()
	ward?: string

	@IsString()
	@IsNotEmpty()
	district: string

	@IsString()
	@IsNotEmpty()
	city: string

	@IsString()
	@IsNotEmpty()
	country: string
}

class UnavailableGoodsValidator extends UnavailableGoods {
	@IsArray()
	@IsString({ each: true })
	@Validate(ObjectIdRule, { each: true })
	@Type(() => Array<string>)
	@IsOptional()
	product = [] as string[]

	@IsArray()
	@IsString({ each: true })
	@Validate(ObjectIdRule, { each: true })
	@Type(() => Array<string>)
	@IsOptional()
	category = [] as string[]

	@IsArray()
	@IsString({ each: true })
	@Validate(ObjectIdRule, { each: true })
	@Type(() => Array<string>)
	@IsOptional()
	option = [] as string[]
}

export class CreateStoreDTO extends PickType(Store, [
	'name',
	'images',
	'openTime',
	'address',
	'unavailableGoods',
] as const) {
	@ApiPropertyMultiFiles()
	images: any[]

	@IsString()
	@IsNotEmpty()
	name: string

	@ValidateNested({ each: true })
	@Type(() => OpenTimeValidator)
	openTime: OpenTimeValidator

	@ValidateNested({ each: true })
	@Type(() => AddressValidator)
	address: AddressValidator

	@ValidateNested({ each: true })
	@Type(() => UnavailableGoodsValidator)
	unavailableGoods: UnavailableGoodsValidator
}