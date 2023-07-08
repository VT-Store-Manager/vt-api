import { Type } from 'class-transformer'
import {
	ArrayMinSize,
	IsArray,
	IsMongoId,
	IsOptional,
	IsPositive,
	Min,
} from 'class-validator'

export class AssignVoucherDTO {
	@IsArray()
	@IsMongoId({ each: true })
	targets: string[] = []

	@IsMongoId({ each: true })
	@IsArray()
	@ArrayMinSize(1)
	vouchers: string[] = []

	@IsOptional()
	@IsPositive()
	@Type(() => Number)
	@Min(new Date(2023, 0, 1).getTime())
	startTime?: number = Date.now()
}
