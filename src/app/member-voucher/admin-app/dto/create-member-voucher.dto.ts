import { Type } from 'class-transformer'
import {
	IsArray,
	IsMongoId,
	IsOptional,
	IsPositive,
	IsString,
	Min,
} from 'class-validator'

export class AssignVoucherDTO {
	@IsArray()
	@IsMongoId({ each: true })
	target: string[] = []

	@IsString()
	@IsMongoId()
	voucher: string

	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	@Min(new Date(2023, 0, 1).getTime())
	startTime?: number = Date.now()
}
