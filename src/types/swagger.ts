import { ApiProperty } from '@nestjs/swagger'

export class ErrorResponseDTO {
	@ApiProperty({ default: 400 })
	statusCode: number

	@ApiProperty()
	error: string

	@ApiProperty()
	message: string
}

export class SuccessResponseDTO<T extends Record<string, any>> {
	@ApiProperty({ default: 200 })
	statusCode: number

	@ApiProperty({ example: 'Successful' })
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
