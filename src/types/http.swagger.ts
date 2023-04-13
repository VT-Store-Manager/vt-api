import { ApiProperty } from '@nestjs/swagger'

export class CommonErrorResponseDTO {
	@ApiProperty({ default: 400 })
	statusCode: number

	@ApiProperty()
	error: string

	@ApiProperty()
	message: string
}

export class ValidationErrorResponseDTO {
	@ApiProperty({ default: 400 })
	statusCode: number

	@ApiProperty()
	error: string

	@ApiProperty()
	message: string[]
}

export class SuccessResponseDTO<T extends Record<string, any>> {
	@ApiProperty({ default: 200 })
	statusCode: number

	@ApiProperty()
	message: string

	@ApiProperty()
	data: T
}

export class NoDataResponseDTO {
	@ApiProperty({ default: 201 })
	statusCode: number

	@ApiProperty()
	message: string
}

export class BooleanResponseDTO {
	@ApiProperty({ default: 201 })
	statusCode: number

	@ApiProperty()
	success: boolean
}
