import { ApiProperty } from '@nestjs/swagger'

export class CommonErrorResponseDto {
	@ApiProperty({ default: 400 })
	statusCode: number

	@ApiProperty()
	error: string

	@ApiProperty()
	message: string
}

export class ValidationErrorResponseDto {
	@ApiProperty({ default: 400 })
	statusCode: number

	@ApiProperty()
	error: string

	@ApiProperty()
	message: string[]
}

export class SuccessResponseDto<T extends Record<string, any>> {
	@ApiProperty({ default: 200 })
	statusCode: number

	@ApiProperty()
	message: string

	@ApiProperty()
	data: T
}
