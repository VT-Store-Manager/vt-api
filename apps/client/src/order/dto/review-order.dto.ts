import { Type } from 'class-transformer'
import {
	IsMongoId,
	IsOptional,
	IsPositive,
	IsString,
	Max,
	Min,
} from 'class-validator'

export class ReviewOrderDTO {
	@Type(() => Number)
	@IsPositive()
	@Min(1)
	@Max(5)
	rate: number

	@IsOptional()
	@IsString()
	review?: string = ''

	@IsOptional()
	@IsMongoId({ each: true })
	like?: string[] = []

	@IsOptional()
	@IsMongoId({ each: true })
	dislike?: string[] = []
}
