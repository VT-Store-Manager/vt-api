import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class CreateVoucherDTO {
	@IsString()
	@IsNotEmpty()
	title: string

	@IsString()
	@Matches(/^[a-zA-Z0-9]+$/)
	code: string

	@IsOptional()
	@IsString()
	description?: string = ''
}
