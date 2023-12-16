import { Type } from 'class-transformer'
import {
	IsString,
	IsNotEmpty,
	IsObject,
	ValidateNested,
	IsMongoId,
	IsNumber,
	IsOptional,
} from 'class-validator'
import { OpenTimeValidator, AddressValidator } from './create-store.dto'

export class UpdateStoreInfoDTO {
	@IsMongoId()
	storeId: string

	@IsString()
	@IsNotEmpty()
	name: string

	@IsObject()
	@ValidateNested()
	@Type(() => OpenTimeValidator)
	openTime: OpenTimeValidator

	@ValidateNested()
	@Type(() => AddressValidator)
	address: AddressValidator

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	lat?: number

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	lng?: number
}
