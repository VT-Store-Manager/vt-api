import { IsString, MinLength } from 'class-validator'

export class SearchMemberDTO {
	@IsString()
	@MinLength(1)
	keyword: string
}
