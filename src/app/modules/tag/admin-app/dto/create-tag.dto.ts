import { IsNotEmpty, IsString } from 'class-validator'

export class CreateTagDTO {
	@IsString()
	@IsNotEmpty()
	name: string
}
